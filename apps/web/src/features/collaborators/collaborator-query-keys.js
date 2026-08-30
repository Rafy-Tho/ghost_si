export const collaboratorQueryKeys = {
  all: ["collaborators"],
  project: (userId, projectId) => ["collaborators", userId, projectId],
};
