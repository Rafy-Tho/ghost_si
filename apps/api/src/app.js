import cors from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/require-auth.js";
import { healthRouter } from "./routes/health.routes.js";

const app = express();

app.disable("x-powered-by");
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
  }),
);
app.use(express.json());
app.use("/api/health", healthRouter);
app.use("/api", requireAuth);

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

export { app };
