import { getAuth } from "@clerk/express";

const bearerHeaderPattern = /^Bearer\s+\S+$/i;

export function requireAuth(request, response, next) {
  const { isAuthenticated, tokenType, userId } = getAuth(request);
  const authorization = request.get("authorization");

  if (
    !bearerHeaderPattern.test(authorization ?? "") ||
    !isAuthenticated ||
    !userId ||
    tokenType !== "session_token"
  ) {
    response.setHeader("WWW-Authenticate", "Bearer");
    response.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  request.userId = userId;
  next();
}
