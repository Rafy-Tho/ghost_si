export class ProjectApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ProjectApiError";
    this.code = code;
    this.status = status;
    this.isPublicApiError = true;
  }
}

export function projectNotFound() {
  return new ProjectApiError(404, "NOT_FOUND", "Project not found");
}

export function projectForbidden() {
  return new ProjectApiError(
    403,
    "FORBIDDEN",
    "You do not have permission to perform this action",
  );
}

export function projectValidationError() {
  return new ProjectApiError(400, "VALIDATION_ERROR", "The request is invalid");
}
