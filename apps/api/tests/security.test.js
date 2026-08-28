import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "../src/middleware/error-handler.js";
import {
  createAuthenticatedRateLimiter,
  createPublicRateLimiter,
} from "../src/middleware/rate-limit.js";
import { requireAuth } from "../src/middleware/require-auth.js";
import { requestId } from "../src/middleware/request-id.js";
import {
  parseBodyLimit,
  parseNodeEnvironment,
  parseOrigin,
  parsePositiveInteger,
} from "../src/config/env-validation.js";

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      resolve({
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
        url: `http://127.0.0.1:${server.address().port}`,
      });
    });
  });
}

test("rejects unknown environments and insecure production origins", () => {
  assert.throws(() => parseNodeEnvironment("staging"), /NODE_ENV/);
  assert.throws(
    () =>
      parseOrigin("http://app.example.com", {
        name: "CLIENT_ORIGIN",
        nodeEnvironment: "production",
      }),
    /HTTPS/,
  );
  assert.throws(
    () =>
      parseOrigin("https://[::1]", {
        name: "CLIENT_ORIGIN",
        nodeEnvironment: "production",
      }),
    /non-local HTTPS origin/,
  );
  for (const loopbackOrigin of [
    "https://localhost.",
    "https://dev.localhost",
    "https://dev.localhost.",
    "https://127.0.0.0",
    "https://127.0.0.2",
    "https://127.255.255.255",
  ]) {
    assert.throws(
      () =>
        parseOrigin(loopbackOrigin, {
          name: "CLIENT_ORIGIN",
          nodeEnvironment: "production",
        }),
      /non-local HTTPS origin/,
    );
  }
  assert.throws(
    () =>
      parseOrigin("https://app.example.com/path", {
        name: "CLIENT_ORIGIN",
        nodeEnvironment: "production",
      }),
    /scheme, host, and port/,
  );
});

test("normalizes safe origins and validates numeric and body limits", () => {
  assert.equal(
    parseOrigin("https://app.example.com/", {
      name: "CLIENT_ORIGIN",
      nodeEnvironment: "production",
    }),
    "https://app.example.com",
  );
  assert.equal(
    parsePositiveInteger("10", {
      maximum: 100,
      name: "RATE_LIMIT_MAX",
    }),
    10,
  );
  assert.equal(
    parseBodyLimit("256kb", {
      defaultValue: "100kb",
      name: "API_BODY_LIMIT",
    }),
    "256kb",
  );
  assert.throws(
    () =>
      parseBodyLimit("50mb", {
        defaultValue: "100kb",
        name: "API_BODY_LIMIT",
      }),
    /between 1kb and 10mb/,
  );
});

test("assigns a safe request ID and rejects unsafe supplied IDs", async () => {
  const app = express();
  app.use(requestId);
  app.get("/request-id", (request, response) => {
    response.json({ requestId: request.requestId });
  });

  const server = await startServer(app);

  try {
    const supplied = await fetch(`${server.url}/request-id`, {
      headers: { "X-Request-Id": "client.request-123" },
    });
    assert.equal(supplied.headers.get("x-request-id"), "client.request-123");

    const unsafe = await fetch(`${server.url}/request-id`, {
      headers: { "X-Request-Id": "x".repeat(129) },
    });
    assert.match(unsafe.headers.get("x-request-id"), /^[0-9a-f-]{36}$/);
  } finally {
    await server.close();
  }
});

test("returns a redacted JSON response for unexpected errors", async () => {
  const app = express();
  app.use(requestId);
  app.get("/error", () => {
    throw new Error("database password should not be returned");
  });
  app.use(errorHandler);

  const server = await startServer(app);

  try {
    const response = await fetch(`${server.url}/error`);
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.equal(payload.error.code, "INTERNAL_SERVER_ERROR");
    assert.equal(payload.error.message, "An unexpected error occurred");
    assert.equal(payload.error.details, undefined);
    assert.match(payload.requestId, /^[0-9a-f-]{36}$/);
  } finally {
    await server.close();
  }
});

test("returns safe errors for invalid and oversized JSON", async () => {
  const app = express();
  app.use(requestId);
  app.use(express.json({ limit: "1kb" }));
  app.post("/payload", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use(errorHandler);

  const server = await startServer(app);

  try {
    const invalid = await fetch(`${server.url}/payload`, {
      body: "{invalid",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(invalid.status, 400);
    assert.deepEqual((await invalid.json()).error, {
      code: "INVALID_JSON",
      message: "Request body must be valid JSON",
    });

    const oversized = await fetch(`${server.url}/payload`, {
      body: JSON.stringify({ value: "x".repeat(2000) }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(oversized.status, 413);
    assert.deepEqual((await oversized.json()).error, {
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body is too large",
    });
  } finally {
    await server.close();
  }
});

test("rate limits public requests with a JSON response", async () => {
  const app = express();
  app.use(createPublicRateLimiter({ max: 1, windowMs: 60_000 }));
  app.get("/limited", (_request, response) => {
    response.json({ status: "ok" });
  });

  const server = await startServer(app);

  try {
    assert.equal((await fetch(`${server.url}/limited`)).status, 200);

    const limited = await fetch(`${server.url}/limited`);
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "60");
    assert.deepEqual(await limited.json(), {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests",
      },
    });
  } finally {
    await server.close();
  }
});

test("rate limits unauthenticated protected requests before authentication", async () => {
  const app = express();
  app.use(
    clerkMiddleware({
      clerkClient: {
        authenticateRequest: async () => ({
          headers: new Headers(),
          status: 200,
          toAuth: () => ({
            isAuthenticated: false,
            tokenType: "session_token",
            userId: null,
          }),
        }),
      },
    }),
  );
  app.use(
    "/protected",
    createAuthenticatedRateLimiter({ max: 1, windowMs: 60_000 }),
  );
  app.use("/protected", requireAuth);
  app.get("/protected", (_request, response) => {
    response.json({ status: "ok" });
  });

  const server = await startServer(app);

  try {
    const unauthorized = await fetch(`${server.url}/protected`);
    assert.equal(unauthorized.status, 401);

    const rateLimited = await fetch(`${server.url}/protected`);
    assert.equal(rateLimited.status, 429);
    assert.deepEqual(await rateLimited.json(), {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests",
      },
    });
  } finally {
    await server.close();
  }
});

test("applies a global rate limit before Clerk middleware", async () => {
  const app = express();
  let clerkRequests = 0;

  app.use(createPublicRateLimiter({ max: 1, windowMs: 60_000 }));
  app.use(
    clerkMiddleware({
      clerkClient: {
        authenticateRequest: async () => {
          clerkRequests += 1;

          return {
            headers: new Headers(),
            status: 200,
            toAuth: () => ({
              isAuthenticated: false,
              tokenType: "session_token",
              userId: null,
            }),
          };
        },
      },
    }),
  );
  app.use("/protected", requireAuth);
  app.get("/protected", (_request, response) => {
    response.json({ status: "ok" });
  });

  const server = await startServer(app);

  try {
    const unauthorized = await fetch(`${server.url}/protected`);
    assert.equal(unauthorized.status, 401);

    const rateLimited = await fetch(`${server.url}/protected`);
    assert.equal(rateLimited.status, 429);
    assert.equal(clerkRequests, 1);
  } finally {
    await server.close();
  }
});
