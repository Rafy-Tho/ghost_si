import { getAuth } from "@clerk/express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

function createRateLimitResponse(windowMs) {
  return (_request, response) => {
    response.setHeader("Retry-After", Math.ceil(windowMs / 1000));
    response.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests",
      },
    });
  };
}

export function createPublicRateLimiter({ max, windowMs }) {
  return rateLimit({
    handler: createRateLimitResponse(windowMs),
    legacyHeaders: false,
    max,
    standardHeaders: "draft-8",
    windowMs,
  });
}

export function createAuthenticatedRateLimiter({ max, windowMs }) {
  return rateLimit({
    handler: createRateLimitResponse(windowMs),
    keyGenerator: (request) => {
      const { userId } = getAuth(request);

      if (userId) {
        return `user:${userId}`;
      }

      return `ip:${ipKeyGenerator(request.ip)}`;
    },
    legacyHeaders: false,
    max,
    standardHeaders: "draft-8",
    windowMs,
  });
}
