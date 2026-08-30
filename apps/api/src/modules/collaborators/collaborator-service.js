import { createClerkUserDirectory } from "../../integrations/clerk/clerk-users.js";
import { requireProjectOwner } from "../projects/project-authorization.js";
import { createCollaboratorRepository } from "./collaborator-repository.js";
import {
  collaboratorExists,
  collaboratorLimitReached,
  collaboratorNotFound,
  cannotAddSelf,
  directoryUnavailable,
  projectNotFound,
  userNotFound,
} from "./collaborator-errors.js";

export const MAX_COLLABORATORS = 100;

function readPrimaryEmail(user) {
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;

  if (primaryEmail) {
    return primaryEmail;
  }

  return user?.emailAddresses?.[0]?.emailAddress ?? null;
}

function readDisplayName(user, email) {
  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user?.username || email || "Former member";
}

function toMemberResponse(record, user) {
  const email = user ? readPrimaryEmail(user) : null;

  return {
    userId: record.userId,
    email,
    displayName: readDisplayName(user, email),
    avatarUrl: user?.imageUrl ?? null,
    status: user ? "active" : "unavailable",
    addedAt: record.createdAt ? record.createdAt.toISOString() : null,
  };
}

function mapUsers(users) {
  return new Map(users.map((user) => [user.id, user]));
}

function mapDirectoryError(error) {
  if (error?.isClerkDirectoryError) {
    throw directoryUnavailable();
  }

  throw error;
}

function audit(event, details) {
  console.info(
    JSON.stringify({
      event,
      level: "info",
      ...details,
    }),
  );
}

export function createCollaboratorService(
  repository = createCollaboratorRepository(),
  userDirectory = createClerkUserDirectory(),
  recordAudit = audit,
) {
  return {
    async listCollaborators(userId, projectId) {
      const project = await repository.findAccessible(projectId, userId);

      if (!project) {
        throw projectNotFound();
      }

      let users;
      try {
        users = await userDirectory.getUsersByIds([
          project.ownerId,
          ...project.collaborators.map(({ userId: collaboratorId }) => collaboratorId),
        ]);
      } catch (error) {
        mapDirectoryError(error);
      }

      const usersById = mapUsers(users);

      return {
        owner: toMemberResponse(
          { createdAt: null, userId: project.ownerId },
          usersById.get(project.ownerId),
        ),
        collaborators: project.collaborators.map((collaborator) =>
          toMemberResponse(collaborator, usersById.get(collaborator.userId)),
        ),
      };
    },

    async addCollaborator(userId, projectId, email) {
      const currentProject = await repository.findAccess(projectId, userId);
      requireProjectOwner(currentProject, userId);

      let user;
      try {
        user = await userDirectory.findByEmail(email);
      } catch (error) {
        mapDirectoryError(error);
      }

      if (!user) {
        throw userNotFound();
      }

      if (user.id === userId) {
        throw cannotAddSelf();
      }

      let collaborator;
      try {
        collaborator = await repository.transaction(async (transactionRepository) => {
          const project = await transactionRepository.findAccess(projectId, userId);
          requireProjectOwner(project, userId);

          const existing = await transactionRepository.findCollaborator(projectId, user.id);
          if (existing) {
            throw collaboratorExists();
          }

          const count = await transactionRepository.countCollaborators(projectId);
          if (count >= MAX_COLLABORATORS) {
            throw collaboratorLimitReached();
          }

          return transactionRepository.create(projectId, user.id);
        });
      } catch (error) {
        if (error?.code === "P2002") {
          throw collaboratorExists();
        }

        throw error;
      }

      recordAudit("collaborator_added", {
        actorUserId: userId,
        projectId,
        targetUserId: user.id,
      });

      return toMemberResponse(collaborator, user);
    },

    async removeCollaborator(userId, projectId, targetUserId) {
      try {
        await repository.transaction(async (transactionRepository) => {
          const project = await transactionRepository.findAccess(projectId, userId);
          requireProjectOwner(project, userId);

          const target = await transactionRepository.findCollaborator(
            projectId,
            targetUserId,
          );
          if (!target) {
            throw collaboratorNotFound();
          }

          await transactionRepository.delete(projectId, targetUserId);
        });
      } catch (error) {
        if (error?.code === "P2025") {
          throw collaboratorNotFound();
        }

        throw error;
      }

      recordAudit("collaborator_removed", {
        actorUserId: userId,
        projectId,
        targetUserId,
      });
    },
  };
}
