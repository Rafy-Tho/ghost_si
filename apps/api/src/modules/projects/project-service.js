import { createProjectRepository } from "./project-repository.js";
import {
  projectNotFound,
} from "./project-errors.js";
import { requireProjectOwner } from "./project-authorization.js";

const DEFAULT_PROJECT_NAME = "Untitled Project";

function toProjectResponse(project, userId) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    access: project.ownerId === userId ? "owner" : "collaborator",
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

function mapPrismaNotFound(error) {
  if (error?.code === "P2025") {
    throw projectNotFound();
  }

  throw error;
}

export function createProjectService(repository = createProjectRepository()) {
  return {
    async listProjects(userId) {
      const projects = await repository.listAccessible(userId);
      return projects.map((project) => toProjectResponse(project, userId));
    },

    async getProject(userId, projectId) {
      const project = await repository.findAccessible(projectId, userId);

      if (!project) {
        throw projectNotFound();
      }

      return toProjectResponse(project, userId);
    },

    async createProject(userId, input) {
      const project = await repository.create({
        name: input.name ?? DEFAULT_PROJECT_NAME,
        ownerId: userId,
      });

      return toProjectResponse(project, userId);
    },

    async renameProject(userId, projectId, input) {
      try {
        const project = await repository.transaction(async (transactionRepository) => {
          const currentProject = await transactionRepository.findAccess(
            projectId,
            userId,
          );
          requireProjectOwner(currentProject, userId);
          return transactionRepository.rename(projectId, input.name);
        });

        return toProjectResponse(project, userId);
      } catch (error) {
        mapPrismaNotFound(error);
      }
    },

    async deleteProject(userId, projectId) {
      try {
        await repository.transaction(async (transactionRepository) => {
          const currentProject = await transactionRepository.findAccess(
            projectId,
            userId,
          );
          requireProjectOwner(currentProject, userId);
          await transactionRepository.delete(projectId);
        });
      } catch (error) {
        mapPrismaNotFound(error);
      }
    },
  };
}
