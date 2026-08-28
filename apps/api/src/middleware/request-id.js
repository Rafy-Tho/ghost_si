import { randomUUID } from "node:crypto";

const requestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

export function requestId(request, response, next) {
  const suppliedRequestId = request.get("x-request-id");
  const id = requestIdPattern.test(suppliedRequestId ?? "")
    ? suppliedRequestId
    : randomUUID();

  request.requestId = id;
  response.setHeader("X-Request-Id", id);
  next();
}
