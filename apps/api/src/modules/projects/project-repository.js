import { prisma } from "@ghost-ai/database";

const projectFields = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export function createProjectRepository(database = prisma) {
  return {
    async listAccessible(userId) {
      return database.project.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: projectFields,
        take: 100,
        where: {
          OR: [
            { ownerId: userId },
            { collaborators: { some: { userId } } },
          ],
        },
      });
    },

    async findAccessible(projectId, userId) {
      return database.project.findFirst({
        select: projectFields,
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
          ...projectFields,
          collaborators: {
            select: { userId: true },
            where: { userId },
          },
        },
        where: { id: projectId },
      });
    },

    async create(data) {
      return database.project.create({
        data,
        select: projectFields,
      });
    },

    async rename(projectId, name) {
      return database.project.update({
        data: { name },
        select: projectFields,
        where: { id: projectId },
      });
    },

    async delete(projectId) {
      return database.project.delete({ where: { id: projectId } });
    },

    async transaction(callback) {
      return database.$transaction((transactionClient) =>
        callback(createProjectRepository(transactionClient)),
      );
    },
  };
}
