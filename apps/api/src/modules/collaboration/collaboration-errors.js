export function collaborationValidationError() {
  const error = new Error("The collaboration request is invalid.");
  error.status = 400;
  error.code = "VALIDATION_ERROR";
  error.isPublicApiError = true;
  return error;
}

export function collaborationNotFound() {
  const error = new Error("Project not found.");
  error.status = 404;
  error.code = "NOT_FOUND";
  error.isPublicApiError = true;
  return error;
}

export function collaborationUnavailable() {
  const error = new Error("Collaboration is temporarily unavailable.");
  error.status = 503;
  error.code = "COLLABORATION_UNAVAILABLE";
  error.isPublicApiError = true;
  return error;
}
