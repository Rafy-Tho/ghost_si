import { prisma } from "@ghost-ai/database";

const collaboratorFields = {
  userId: true,
  createdAt: true,
};

export function createCollaboratorRepository(database = prisma) {
  return {
    async findAccessible(projectId, userId) {
      return database.project.findFirst({
        select: {
          ownerId: true,
          collaborators: {
            orderBy: { createdAt: "asc" },
            select: collaboratorFields,
            take: 100,
          },
        },
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { collaborators: { some: { userId } } },
          ],
        },
      });
    },

    async findAccess(projectId, userId) {
      return database.project.findUnique({
        select: {
          ownerId: true,
          collaborators: {
            select: { userId: true },
            where: { userId },
          },
        },
        where: { id: projectId },
      });
    },

    async findCollaborator(projectId, userId) {
      return database.projectCollaborator.findUnique({
        select: collaboratorFields,
        where: { projectId_userId: { projectId, userId } },
      });
    },

    async countCollaborators(projectId) {
      return database.projectCollaborator.count({ where: { projectId } });
    },

    async create(projectId, userId) {
      return database.projectCollaborator.create({
        data: { projectId, userId },
        select: collaboratorFields,
      });
    },

    async delete(projectId, userId) {
      return database.projectCollaborator.delete({
        where: { projectId_userId: { projectId, userId } },
      });
    },

    async transaction(callback) {
      return database.$transaction((transactionClient) =>
        callback(createCollaboratorRepository(transactionClient)),
      );
    },
  };
}
