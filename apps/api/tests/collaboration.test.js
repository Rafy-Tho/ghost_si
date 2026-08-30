import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { errorHandler } from "../src/middleware/error-handler.js";
import { requestId } from "../src/middleware/request-id.js";
import { createCollaborationRouter } from "../src/modules/collaboration/collaboration.routes.js";
import { createCollaborationService } from "../src/modules/collaboration/collaboration-service.js";

const OWNER_ID = "user-owner";
const COLLABORATOR_ID = "user-collaborator";
const UNRELATED_ID = "user-unrelated";
const PROJECT_ID = "project-owned";

function createRepository() {
  return {
    async findAccessible(projectId, userId) {
      if (projectId !== PROJECT_ID || ![OWNER_ID, COLLABORATOR_ID].includes(userId)) {
        return null;
      }
      return { id: projectId };
    },
  };
}

function createLiveblocks() {
  const rooms = new Set();
  const calls = { createRoom: 0 };

  return {
    calls,
    async getRoom(roomId) {
      if (!rooms.has(roomId)) {
        const error = new Error("Room not found");
        error.status = 404;
        throw error;
      }
      return { id: roomId };
    },
    async createRoom(roomId) {
      calls.createRoom += 1;
      rooms.add(roomId);
      return { id: roomId };
    },
    prepareSession(userId, { userInfo }) {
      return {
        allow(roomId, permissions) {
          assert.equal(roomId, PROJECT_ID);
          assert.deepEqual(permissions, ["room:read", "room:write"]);
        },
        async authorize() {
          return {
            status: 200,
            body: JSON.stringify({ userId, userInfo }),
          };
        },
      };
    },
  };
}

function createServer(userId, service) {
  const app = express();
  app.use(requestId);
  app.use(express.json({ limit: "10kb" }));
  app.use((request, response, next) => {
    if (!userId) {
      response.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }
    request.userId = userId;
    next();
  });
  app.use("/api", createCollaborationRouter({ service }));
  app.use(errorHandler);
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve({
      close: () => new Promise((closeResolve) => server.close(closeResolve)),
      url: `http://127.0.0.1:${server.address().port}`,
    }));
  });
}

function createService(liveblocks) {
  return createCollaborationService(
    createRepository(),
    {
      async getUserById() {
        return { firstName: "Ghost", lastName: "User", imageUrl: "https://example.com/avatar.png" };
      },
    },
    liveblocks,
  );
}

test("authorizes project members with metadata and creates a room once", async () => {
  const liveblocks = createLiveblocks();
  const service = createService(liveblocks);
  const ownerServer = await createServer(OWNER_ID, service);
  const collaboratorServer = await createServer(COLLABORATOR_ID, service);

  try {
    const ownerResponse = await fetch(`${ownerServer.url}/api/liveblocks-auth`, {
      body: JSON.stringify({ projectId: PROJECT_ID }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(ownerResponse.status, 200);
    const ownerPayload = await ownerResponse.json();
    assert.equal(ownerPayload.userId, OWNER_ID);
    assert.equal(ownerPayload.userInfo.displayName, "Ghost User");
    assert.equal(typeof ownerPayload.userInfo.cursorColor, "string");

    const collaboratorResponse = await fetch(`${collaboratorServer.url}/api/liveblocks-auth`, {
      body: JSON.stringify({ projectId: PROJECT_ID }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(collaboratorResponse.status, 200);
    assert.equal((await collaboratorResponse.json()).userId, COLLABORATOR_ID);

    const forgedResponse = await fetch(`${collaboratorServer.url}/api/liveblocks-auth`, {
      body: JSON.stringify({ projectId: PROJECT_ID, roomId: "forged-room" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(forgedResponse.status, 400);
    assert.equal(liveblocks.calls.createRoom, 1);
  } finally {
    await ownerServer.close();
    await collaboratorServer.close();
  }
});

test("hides inaccessible projects and rejects unauthenticated requests", async () => {
  const service = createService(createLiveblocks());
  const unrelatedServer = await createServer(UNRELATED_ID, service);
  const unauthenticatedServer = await createServer(null, service);

  try {
    const hidden = await fetch(`${unrelatedServer.url}/api/liveblocks-auth`, {
      body: JSON.stringify({ projectId: PROJECT_ID }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(hidden.status, 404);

    const unauthenticated = await fetch(`${unauthenticatedServer.url}/api/liveblocks-auth`, {
      body: JSON.stringify({ projectId: PROJECT_ID }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(unauthenticated.status, 401);
  } finally {
    await unrelatedServer.close();
    await unauthenticatedServer.close();
  }
});
