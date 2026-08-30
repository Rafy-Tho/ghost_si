import {
  projectForbidden,
  projectNotFound,
} from "../projects/project-errors.js";

export class CollaboratorApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "CollaboratorApiError";
    this.code = code;
    this.status = status;
    this.isPublicApiError = true;
  }
}

export { projectForbidden, projectNotFound };

export function collaboratorValidationError() {
  return new CollaboratorApiError(400, "VALIDATION_ERROR", "The request is invalid");
}

export function collaboratorNotFound() {
  return new CollaboratorApiError(404, "NOT_FOUND", "Collaborator not found");
}

export function collaboratorExists() {
  return new CollaboratorApiError(
    409,
    "COLLABORATOR_EXISTS",
    "This user is already a collaborator",
  );
}

export function cannotAddSelf() {
  return new CollaboratorApiError(
    409,
    "CANNOT_ADD_SELF",
    "The project owner is already a member",
  );
}

export function collaboratorLimitReached() {
  return new CollaboratorApiError(
    422,
    "COLLABORATOR_LIMIT_REACHED",
    "This project has reached its collaborator limit",
  );
}

export function userNotFound() {
  return new CollaboratorApiError(
    422,
    "USER_NOT_FOUND",
    "No existing account was found for that email",
  );
}

export function directoryUnavailable() {
  return new CollaboratorApiError(
    503,
    "DIRECTORY_UNAVAILABLE",
    "The user directory is temporarily unavailable",
  );
}
