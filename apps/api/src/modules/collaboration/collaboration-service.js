import { createClerkUserDirectory } from "../../integrations/clerk/clerk-users.js";
import { getLiveblocksClient } from "../../integrations/liveblocks/liveblocks-client.js";
import { createProjectRepository } from "../projects/project-repository.js";
import { collaborationNotFound, collaborationUnavailable } from "./collaboration-errors.js";

const cursorColors = ["#00c8d4", "#6457f9", "#34d399", "#fbbf24", "#ff4d4f", "#8b82ff"];

function cursorColorForUser(userId) {
  let hash = 0;
  for (const character of userId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return cursorColors[hash % cursorColors.length];
}

function displayNameForUser(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return fullName || user?.username || "Ghost AI user";
}

function isMissingRoom(error) {
  return error?.status === 404 || error?.statusCode === 404;
}

async function ensureRoom(client, roomId) {
  try {
    await client.getRoom(roomId);
  } catch (error) {
    if (!isMissingRoom(error)) {
      throw error;
    }

    try {
      await client.createRoom(roomId, { defaultAccesses: [] });
    } catch (createError) {
      if (createError?.status !== 409 && createError?.statusCode !== 409) {
        throw createError;
      }
    }
  }
}

export function createCollaborationService(
  repository = createProjectRepository(),
  userDirectory = createClerkUserDirectory(),
  liveblocks = null,
) {
  return {
    async authorize(userId, projectId) {
      const project = await repository.findAccessible(projectId, userId);
      if (!project) {
        throw collaborationNotFound();
      }

      let user;
      try {
        user = await userDirectory.getUserById(userId);
      } catch {
        throw collaborationUnavailable();
      }
      const userInfo = {
        userId,
        displayName: displayNameForUser(user),
        avatarUrl: user?.imageUrl ?? null,
        cursorColor: cursorColorForUser(userId),
      };

      try {
        const liveblocksClient = liveblocks ?? getLiveblocksClient();
        await ensureRoom(liveblocksClient, projectId);
        const session = liveblocksClient.prepareSession(userId, { userInfo });
        session.allow(projectId, ["room:read", "room:write"]);
        const authorization = await session.authorize();
        if (authorization.status >= 400) {
          throw authorization.error ?? new Error("Liveblocks authorization failed");
        }
        return authorization;
      } catch (error) {
        if (error?.status === 404) {
          throw collaborationNotFound();
        }
        throw collaborationUnavailable();
      }
    },
  };
}
