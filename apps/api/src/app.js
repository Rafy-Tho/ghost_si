import cors from "cors";
import express from "express";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requireAuth } from "./middleware/require-auth.js";
import { requestId } from "./middleware/request-id.js";
import {
  createAuthenticatedRateLimiter,
  createPublicRateLimiter,
} from "./middleware/rate-limit.js";
import { healthRouter } from "./routes/health.routes.js";

const app = express();

app.set("trust proxy", env.trustProxyHops);
app.disable("x-powered-by");
app.use(requestId);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    strictTransportSecurity:
      env.nodeEnv === "production" ? undefined : false,
  }),
);
app.use(
  clerkMiddleware({
    authorizedParties: [env.clientOrigin],
  }),
);
app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    origin: env.clientOrigin,
    credentials: false,
    maxAge: 600,
  }),
);
app.use(
  "/api/health",
  createPublicRateLimiter({
    max: env.rateLimit.healthMax,
    windowMs: env.rateLimit.windowMs,
  }),
  healthRouter,
);
app.use("/api", requireAuth);
app.use(
  "/api",
  createAuthenticatedRateLimiter({
    max: env.rateLimit.max,
    windowMs: env.rateLimit.windowMs,
  }),
);
app.use("/api", express.json({ limit: env.requestBodyLimit, strict: true }));

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

app.use(errorHandler);

export { app };
