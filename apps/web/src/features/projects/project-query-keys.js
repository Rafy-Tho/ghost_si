export const projectQueryKeys = {
  all: ["projects"],
  detail: (userId, projectId) => ["projects", userId, projectId],
  list: (userId) => ["projects", userId],
};
