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
import { collaboratorRouter } from "./modules/collaborators/collaborator.routes.js";
import { projectRouter } from "./modules/projects/project.routes.js";

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
  createPublicRateLimiter({
    max: env.rateLimit.globalMax,
    windowMs: env.rateLimit.windowMs,
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
app.use(
  "/api",
  createAuthenticatedRateLimiter({
    max: env.rateLimit.max,
    windowMs: env.rateLimit.windowMs,
  }),
);
app.use("/api", requireAuth);
app.use(
  "/api/projects",
  express.json({ limit: env.projectBodyLimit, strict: true }),
);
app.use("/api", express.json({ limit: env.requestBodyLimit, strict: true }));
app.use(
  "/api/projects/:projectId/collaborators",
  createAuthenticatedRateLimiter({
    max: env.rateLimit.collaboratorMax,
    windowMs: env.rateLimit.windowMs,
  }),
  collaboratorRouter,
);
app.use("/api/projects", projectRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
    requestId: _request.requestId,
  });
});

app.use(errorHandler);

export { app };
