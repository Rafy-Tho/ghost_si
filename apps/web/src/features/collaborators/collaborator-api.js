import { createAuthenticatedApiClient } from "../../services/api-client.js";

function readMember(value, label) {
  if (
    !value ||
    typeof value !== "object" ||
    typeof value.userId !== "string" ||
    typeof value.displayName !== "string" ||
    !["active", "unavailable"].includes(value.status) ||
    (value.email !== null && typeof value.email !== "string") ||
    (value.avatarUrl !== null && typeof value.avatarUrl !== "string") ||
    (value.addedAt !== null && typeof value.addedAt !== "string")
  ) {
    throw new Error(`The ${label} response was invalid.`);
  }

  return value;
}

function readCollaboratorsPayload(payload) {
  if (!payload || !Array.isArray(payload.collaborators)) {
    throw new Error("The collaborator response was invalid.");
  }

  return {
    collaborators: payload.collaborators.map((member) =>
      readMember(member, "collaborator"),
    ),
    owner: readMember(payload.owner, "owner"),
  };
}

function readCollaboratorPayload(payload) {
  return readMember(payload?.collaborator, "collaborator");
}

export function createCollaboratorApi(getToken) {
  const request = createAuthenticatedApiClient(getToken);

  return {
    async listCollaborators(projectId, { signal } = {}) {
      const payload = await request(
        `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
        { method: "GET", signal },
      );

      return readCollaboratorsPayload(payload);
    },

    async addCollaborator(projectId, email, { signal } = {}) {
      const payload = await request(
        `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
        {
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
          signal,
        },
      );

      return readCollaboratorPayload(payload);
    },

    async removeCollaborator(projectId, userId, { signal } = {}) {
      await request(
        `/api/projects/${encodeURIComponent(projectId)}/collaborators/${encodeURIComponent(userId)}`,
        { method: "DELETE", signal },
      );
    },
  };
}
