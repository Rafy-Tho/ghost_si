function getErrorDetails(error) {
  if (error?.isPublicApiError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
    };
  }

  if (error?.type === "entity.too.large") {
    return {
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body is too large",
      status: 413,
    };
  }

  if (error?.type === "entity.parse.failed") {
    return {
      code: "INVALID_JSON",
      message: "Request body must be valid JSON",
      status: 400,
    };
  }

  if (error?.status === 400 || error?.statusCode === 400) {
    return {
      code: "BAD_REQUEST",
      message: "The request is invalid",
      status: 400,
    };
  }

  return {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    status: 500,
  };
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const details = getErrorDetails(error);

  console.error(
    JSON.stringify({
      event: "request_error",
      level: "error",
      method: request.method,
      path: request.path,
      requestId: request.requestId,
      status: details.status,
      errorType: error?.name ?? "UnknownError",
    }),
  );

  response.status(details.status).json({
    error: {
      code: details.code,
      message: details.message,
    },
    requestId: request.requestId,
  });
}
