import { createAuthenticatedApiClient } from "../../services/api-client.js";

function readProjectsPayload(payload) {
  if (!payload || !Array.isArray(payload.projects)) {
    throw new Error("The project list response was invalid.");
  }

  return payload.projects;
}

function readProjectPayload(payload) {
  if (!payload?.project || typeof payload.project !== "object") {
    throw new Error("The project response was invalid.");
  }

  return payload.project;
}

export function createProjectApi(getToken) {
  const request = createAuthenticatedApiClient(getToken);

  return {
    async listProjects({ signal } = {}) {
      const payload = await request("/api/projects", {
        method: "GET",
        signal,
      });

      return readProjectsPayload(payload);
    },

    async getProject(projectId, { signal } = {}) {
      const payload = await request(
        `/api/projects/${encodeURIComponent(projectId)}`,
        {
          method: "GET",
          signal,
        },
      );

      return readProjectPayload(payload);
    },

    async createProject(name) {
      const payload = await request("/api/projects", {
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      return readProjectPayload(payload);
    },

    async renameProject(projectId, name) {
      const payload = await request(
        `/api/projects/${encodeURIComponent(projectId)}`,
        {
          body: JSON.stringify({ name }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        },
      );

      return readProjectPayload(payload);
    },

    async deleteProject(projectId) {
      await request(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "DELETE",
      });
    },
  };
}
