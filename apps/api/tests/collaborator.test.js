import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { errorHandler } from "../src/middleware/error-handler.js";
import { requestId } from "../src/middleware/request-id.js";
import { createPublicRateLimiter } from "../src/middleware/rate-limit.js";
import { createCollaboratorRouter } from "../src/modules/collaborators/collaborator.routes.js";
import { createCollaboratorService } from "../src/modules/collaborators/collaborator-service.js";
import { ClerkDirectoryError } from "../src/integrations/clerk/clerk-users.js";

const OWNER_ID = "user-owner";
const COLLABORATOR_ID = "user-collaborator";
const NEW_USER_ID = "user-new";
const UNRELATED_ID = "user-unrelated";

function dateAt(seconds) {
  return new Date(`2026-08-28T00:00:${String(seconds).padStart(2, "0")}.000Z`);
}

function userRecord(id, email, firstName, lastName, imageUrl = null) {
  return {
    emailAddresses: [{ emailAddress: email }],
    firstName,
    id,
    imageUrl,
    lastName,
    primaryEmailAddress: { emailAddress: email },
    username: null,
  };
}

const users = [
  userRecord(OWNER_ID, "owner@example.com", "Project", "Owner"),
  userRecord(
    COLLABORATOR_ID,
    "collaborator@example.com",
    "Current",
    "Collaborator",
    "https://img.clerk.com/collaborator",
  ),
  userRecord(NEW_USER_ID, "new@example.com", "New", "Member"),
];

function projectRecord() {
  return {
    collaborators: [
      { createdAt: dateAt(1), userId: COLLABORATOR_ID },
    ],
    id: "project-owned",
    ownerId: OWNER_ID,
  };
}

function createMemoryRepository() {
  const project = projectRecord();

  return {
    async findAccessible(projectId, userId) {
      if (
        projectId !== project.id ||
        (project.ownerId !== userId &&
          !project.collaborators.some(({ userId: memberId }) => memberId === userId))
      ) {
        return null;
      }

      return {
        ownerId: project.ownerId,
        collaborators: project.collaborators
          .slice()
          .sort((left, right) => left.createdAt - right.createdAt)
          .slice(0, 100),
      };
    },

    async findAccess(projectId, userId) {
      if (projectId !== project.id) {
        return null;
      }

      return {
        collaborators: project.collaborators.filter(
          ({ userId: memberId }) => memberId === userId,
        ),
        ownerId: project.ownerId,
      };
    },

    async findCollaborator(projectId, userId) {
      return projectId === project.id
        ? project.collaborators.find(({ userId: memberId }) => memberId === userId) ?? null
        : null;
    },

    async countCollaborators(projectId) {
      return projectId === project.id ? project.collaborators.length : 0;
    },

    async create(projectId, userId) {
      const collaborator = { createdAt: dateAt(2), userId };
      project.collaborators.push(collaborator);
      return collaborator;
    },

    async delete(projectId, userId) {
      const index = project.collaborators.findIndex(
        ({ userId: memberId }) => projectId === project.id && memberId === userId,
      );

      if (index === -1) {
        const error = new Error("Not found");
        error.code = "P2025";
        throw error;
      }

      project.collaborators.splice(index, 1);
    },

    async transaction(callback) {
      return callback(this);
    },
  };
}

function createUserDirectory({ unavailable = false } = {}) {
  return {
    async findByEmail(email) {
      if (unavailable) {
        throw new ClerkDirectoryError(new Error("Clerk unavailable"));
      }

      return (
        users.find((user) =>
          user.emailAddresses.some(
            ({ emailAddress }) => emailAddress.toLowerCase() === email.toLowerCase(),
          ),
        ) ?? null
      );
    },

    async getUsersByIds(userIds) {
      if (unavailable) {
        throw new ClerkDirectoryError(new Error("Clerk unavailable"));
      }

      return users.filter((user) => userIds.includes(user.id));
    },
  };
}

function createService(options = {}) {
  return createCollaboratorService(
    createMemoryRepository(),
    createUserDirectory(options),
    () => {},
  );
}

function createTestServer(userId, service) {
  const app = express();
  app.use(requestId);
  app.use(express.json({ limit: "10kb" }));
  app.use((request, response, next) => {
    if (!userId) {
      response.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
        requestId: request.requestId,
      });
      return;
    }

    request.userId = userId;
    next();
  });
  app.use(
    "/api/projects/:projectId/collaborators",
    createCollaboratorRouter({ service }),
  );
  app.use(errorHandler);

  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      resolve({
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
        url: `http://127.0.0.1:${server.address().port}`,
      });
    });
  });
}

function createLimitedTestServer(userId, service) {
  const app = express();
  app.use(requestId);
  app.use(express.json({ limit: "10kb" }));
  app.use((request, response, next) => {
    if (!userId) {
      response.status(401).end();
      return;
    }

    request.userId = userId;
    next();
  });
  app.use(
    "/api/projects/:projectId/collaborators",
    createPublicRateLimiter({ max: 1, windowMs: 60_000 }),
    createCollaboratorRouter({ service }),
  );
  app.use(errorHandler);

  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      resolve({
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
        url: `http://127.0.0.1:${server.address().port}`,
      });
    });
  });
}

test("lists the owner and enriched collaborators for a project member", async () => {
  const server = await createTestServer(
    COLLABORATOR_ID,
    createService(),
  );

  try {
    const response = await fetch(
      `${server.url}/api/projects/project-owned/collaborators`,
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      collaborators: [
        {
          addedAt: "2026-08-28T00:00:01.000Z",
          avatarUrl: "https://img.clerk.com/collaborator",
          displayName: "Current Collaborator",
          email: "collaborator@example.com",
          status: "active",
          userId: COLLABORATOR_ID,
        },
      ],
      owner: {
        addedAt: null,
        avatarUrl: null,
        displayName: "Project Owner",
        email: "owner@example.com",
        status: "active",
        userId: OWNER_ID,
      },
    });
  } finally {
    await server.close();
  }
});

test("keeps a safe former-member state when a Clerk profile is unavailable", async () => {
  const directory = createUserDirectory();
  const service = createCollaboratorService(
    createMemoryRepository(),
    {
      ...directory,
      async getUsersByIds(userIds) {
        const availableUsers = await directory.getUsersByIds(userIds);
        return availableUsers.filter((user) => user.id !== COLLABORATOR_ID);
      },
    },
    () => {},
  );
  const server = await createTestServer(OWNER_ID, service);

  try {
    const response = await fetch(
      `${server.url}/api/projects/project-owned/collaborators`,
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(payload.collaborators[0], {
      addedAt: "2026-08-28T00:00:01.000Z",
      avatarUrl: null,
      displayName: "Former member",
      email: null,
      status: "unavailable",
      userId: COLLABORATOR_ID,
    });
  } finally {
    await server.close();
  }
});

test("owners add normalized existing users and reject duplicates, self, and unknown users", async () => {
  const server = await createTestServer(OWNER_ID, createService());

  try {
    const added = await fetch(
      `${server.url}/api/projects/project-owned/collaborators`,
      {
        body: JSON.stringify({ email: "  NEW@EXAMPLE.COM " }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    assert.equal(added.status, 201);
    assert.equal((await added.json()).collaborator.userId, NEW_USER_ID);

    const duplicate = await fetch(
      `${server.url}/api/projects/project-owned/collaborators`,
      {
        body: JSON.stringify({ email: "new@example.com" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    assert.equal(duplicate.status, 409);
    assert.equal((await duplicate.json()).error.code, "COLLABORATOR_EXISTS");

    const self = await fetch(
      `${server.url}/api/projects/project-owned/collaborators`,
      {
        body: JSON.stringify({ email: "owner@example.com" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    assert.equal(self.status, 409);
    assert.equal((await self.json()).error.code, "CANNOT_ADD_SELF");

    const unknown = await fetch(
      `${server.url}/api/projects/project-owned/collaborators`,
      {
        body: JSON.stringify({ email: "missing@example.com" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    assert.equal(unknown.status, 422);
    assert.equal((await unknown.json()).error.code, "USER_NOT_FOUND");
  } finally {
    await server.close();
  }
});

test("only owners can remove collaborators and inaccessible projects stay hidden", async () => {
  const ownerServer = await createTestServer(OWNER_ID, createService());
  const collaboratorServer = await createTestServer(
    COLLABORATOR_ID,
    createService(),
  );
  const unrelatedServer = await createTestServer(UNRELATED_ID, createService());

  try {
    const forbidden = await fetch(
      `${collaboratorServer.url}/api/projects/project-owned/collaborators/${NEW_USER_ID}`,
      { method: "DELETE" },
    );
    assert.equal(forbidden.status, 403);

    const hidden = await fetch(
      `${unrelatedServer.url}/api/projects/project-owned/collaborators`,
    );
    assert.equal(hidden.status, 404);

    const removed = await fetch(
      `${ownerServer.url}/api/projects/project-owned/collaborators/${COLLABORATOR_ID}`,
      { method: "DELETE" },
    );
    assert.equal(removed.status, 204);
  } finally {
    await ownerServer.close();
    await collaboratorServer.close();
    await unrelatedServer.close();
  }
});

test("returns safe errors for invalid input, unauthenticated requests, and directory failures", async () => {
  const ownerServer = await createTestServer(OWNER_ID, createService());
  const unauthenticatedServer = await createTestServer(null, createService());
  const unavailableServer = await createTestServer(
    OWNER_ID,
    createService({ unavailable: true }),
  );

  try {
    const invalid = await fetch(
      `${ownerServer.url}/api/projects/project-owned/collaborators`,
      {
        body: JSON.stringify({ email: "not-an-email", extra: true }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    assert.equal(invalid.status, 400);

    const unauthenticated = await fetch(
      `${unauthenticatedServer.url}/api/projects/project-owned/collaborators`,
    );
    assert.equal(unauthenticated.status, 401);

    const unavailable = await fetch(
      `${unavailableServer.url}/api/projects/project-owned/collaborators`,
    );
    assert.equal(unavailable.status, 503);
    assert.equal((await unavailable.json()).error.code, "DIRECTORY_UNAVAILABLE");
  } finally {
    await ownerServer.close();
    await unauthenticatedServer.close();
    await unavailableServer.close();
  }
});

test("applies the collaborator limiter to every route under the collaborator base path", async () => {
  const server = await createLimitedTestServer(OWNER_ID, createService());

  try {
    const first = await fetch(
      `${server.url}/api/projects/project-owned/collaborators`,
    );
    const second = await fetch(
      `${server.url}/api/projects/project-owned/collaborators/${COLLABORATOR_ID}`,
      { method: "DELETE" },
    );

    assert.equal(first.status, 200);
    assert.equal(second.status, 429);
  } finally {
    await server.close();
  }
});
