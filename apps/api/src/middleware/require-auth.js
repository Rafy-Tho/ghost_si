import { getAuth } from "@clerk/express";

export function requireAuth(request, response, next) {
  const { isAuthenticated, userId } = getAuth(request);

  if (!isAuthenticated || !userId) {
    response.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  next();
}
