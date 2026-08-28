import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { requireAuth } from "../src/middleware/require-auth.js";

function createTestServer(authState) {
  const app = express();

  app.use(
    clerkMiddleware({
      clerkClient: {
        authenticateRequest: async () => ({
          headers: new Headers(),
          status: 200,
          toAuth: () => authState,
        }),
      },
    }),
  );
  app.use("/protected", requireAuth);
  app.get("/protected", (_request, response) => {
    response.json({ status: "ok" });
  });

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
        url: `http://127.0.0.1:${server.address().port}`,
      });
    });
  });
}

test("rejects unauthenticated API requests with the standard error shape", async () => {
  const server = await createTestServer({
    isAuthenticated: false,
    tokenType: "session_token",
    userId: null,
  });

  try {
    const response = await fetch(`${server.url}/protected`);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  } finally {
    await server.close();
  }
});

test("allows authenticated API requests through the guard", async () => {
  const server = await createTestServer({
    isAuthenticated: true,
    tokenType: "session_token",
    userId: "user_test123",
  });

  try {
    const response = await fetch(`${server.url}/protected`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  } finally {
    await server.close();
  }
});
