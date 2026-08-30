import {
  projectForbidden,
  projectNotFound,
} from "./project-errors.js";

/**
 * Owner-only actions expose 403 only to users who are already project members.
 * Unrelated users receive 404 so project existence cannot be enumerated.
 */
export function requireProjectOwner(project, userId) {
  if (!project) {
    throw projectNotFound();
  }

  if (project.ownerId === userId) {
    return;
  }

  if (project.collaborators?.some(({ userId: collaboratorId }) => collaboratorId === userId)) {
    throw projectForbidden();
  }

  throw projectNotFound();
}

export function requireProjectMember(project, userId) {
  if (!project) {
    throw projectNotFound();
  }

  if (
    project.ownerId === userId ||
    project.collaborators?.some(({ userId: collaboratorId }) => collaboratorId === userId)
  ) {
    return;
  }

  throw projectNotFound();
}
