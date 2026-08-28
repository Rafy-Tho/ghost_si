import {
  projectForbidden,
  projectNotFound,
} from "./project-errors.js";

export function requireProjectOwner(project, userId) {
  if (!project) {
    throw projectNotFound();
  }

  if (project.ownerId === userId) {
    return;
  }

  if (project.collaborators.length > 0) {
    throw projectForbidden();
  }

  throw projectNotFound();
}
