import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { errorHandler } from "../src/middleware/error-handler.js";
import { requestId } from "../src/middleware/request-id.js";
import { createProjectRouter } from "../src/modules/projects/project.routes.js";
import { createProjectService } from "../src/modules/projects/project-service.js";

const OWNER_ID = "user-owner";
const COLLABORATOR_ID = "user-collaborator";
const UNRELATED_ID = "user-unrelated";

function projectRecord({ id, ownerId, name, collaborators = [], status = "DRAFT" }) {
  const now = new Date("2026-08-28T00:00:00.000Z");

  return {
    id,
    ownerId,
    name,
    description: null,
    status,
    createdAt: now,
    updatedAt: now,
    collaborators: collaborators.map((userId) => ({ userId })),
  };
}

function createMemoryRepository(initialProjects) {
  const projects = new Map(
    initialProjects.map((project) => [project.id, project]),
  );

  const repository = {
    async listAccessible(userId) {
      return [...projects.values()]
        .filter(
          (project) =>
            project.ownerId === userId ||
            project.collaborators.some(({ userId: collaboratorId }) =>
              collaboratorId === userId,
            ),
        )
        .sort((left, right) => right.createdAt - left.createdAt);
    },

    async findAccess(projectId, userId) {
      const project = projects.get(projectId);

      if (!project) {
        return null;
      }

      return {
        ...project,
        collaborators: project.collaborators.filter(
          ({ userId: collaboratorId }) => collaboratorId === userId,
        ),
      };
    },

    async create(data) {
      const now = new Date("2026-08-28T00:00:01.000Z");
      const project = {
        id: `project-${projects.size + 1}`,
        ...data,
        description: null,
        status: "DRAFT",
        createdAt: now,
        updatedAt: now,
        collaborators: [],
      };
      projects.set(project.id, project);
      return project;
    },

    async rename(projectId, name) {
      const project = projects.get(projectId);
      const updatedProject = {
        ...project,
        name,
        updatedAt: new Date("2026-08-28T00:00:02.000Z"),
      };
      projects.set(projectId, updatedProject);
      return updatedProject;
    },

    async delete(projectId) {
      projects.delete(projectId);
    },

    async transaction(callback) {
      return callback(repository);
    },
  };

  return repository;
}

function createTestServer(userId, service) {
  const app = express();
  app.use(requestId);
  app.use(express.json({ limit: "10kb" }));
  app.use((request, response, next) => {
    if (!userId) {
      response.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
        requestId: request.requestId,
      });
      return;
    }

    request.userId = userId;
    next();
  });
  app.use("/api/projects", createProjectRouter({ service }));
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

function createService() {
  return createProjectService(
    createMemoryRepository([
      projectRecord({
        collaborators: [COLLABORATOR_ID],
        id: "project-owned",
        name: "Owned Project",
        ownerId: OWNER_ID,
      }),
      projectRecord({
        id: "project-shared",
        name: "Shared Project",
        ownerId: OWNER_ID,
        status: "ARCHIVED",
      }),
    ]),
  );
}

test("lists owned and shared projects with derived access", async () => {
  const server = await createTestServer(COLLABORATOR_ID, createService());

  try {
    const response = await fetch(`${server.url}/api/projects`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      projects: [
        {
          access: "collaborator",
          createdAt: "2026-08-28T00:00:00.000Z",
          description: null,
          id: "project-owned",
          name: "Owned Project",
          status: "DRAFT",
          updatedAt: "2026-08-28T00:00:00.000Z",
        },
      ],
    });
  } finally {
    await server.close();
  }
});

test("creates an untitled project with server-derived ownership", async () => {
  const server = await createTestServer(OWNER_ID, createService());

  try {
    const response = await fetch(`${server.url}/api/projects`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 201);
    const payload = await response.json();
    assert.equal(payload.project.name, "Untitled Project");
    assert.equal(payload.project.access, "owner");
    assert.equal(payload.project.status, "DRAFT");
    assert.equal(payload.project.ownerId, undefined);
  } finally {
    await server.close();
  }
});

test("rejects blank names and unknown fields", async () => {
  const server = await createTestServer(OWNER_ID, createService());

  try {
    const blank = await fetch(`${server.url}/api/projects`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ name: "   " }),
    });
    assert.equal(blank.status, 400);

    const unknown = await fetch(`${server.url}/api/projects`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ name: "Valid", ownerId: "forged" }),
    });
    assert.equal(unknown.status, 400);
  } finally {
    await server.close();
  }
});

test("allows owners to rename and permanently delete projects", async () => {
  const service = createService();
  const server = await createTestServer(OWNER_ID, service);

  try {
    const rename = await fetch(`${server.url}/api/projects/project-owned`, {
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      body: JSON.stringify({ name: "Renamed Project" }),
    });
    assert.equal(rename.status, 200);
    assert.equal((await rename.json()).project.name, "Renamed Project");

    const remove = await fetch(`${server.url}/api/projects/project-owned`, {
      method: "DELETE",
    });
    assert.equal(remove.status, 204);

    const missing = await fetch(`${server.url}/api/projects/project-owned`);
    assert.equal(missing.status, 404);
  } finally {
    await server.close();
  }
});

test("forbids collaborators and hides unrelated project IDs", async () => {
  const collaboratorServer = await createTestServer(
    COLLABORATOR_ID,
    createService(),
  );
  const unrelatedServer = await createTestServer(UNRELATED_ID, createService());

  try {
    const forbidden = await fetch(
      `${collaboratorServer.url}/api/projects/project-owned`,
      {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({ name: "Nope" }),
      },
    );
    assert.equal(forbidden.status, 403);

    const hidden = await fetch(
      `${unrelatedServer.url}/api/projects/project-owned`,
      {
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      },
    );
    assert.equal(hidden.status, 404);
  } finally {
    await collaboratorServer.close();
    await unrelatedServer.close();
  }
});

test("returns archived projects to their owner and hides malformed IDs", async () => {
  const server = await createTestServer(OWNER_ID, createService());

  try {
    const list = await fetch(`${server.url}/api/projects`);
    const projects = (await list.json()).projects;
    assert.equal(projects.some((project) => project.status === "ARCHIVED"), true);

    const malformed = await fetch(`${server.url}/api/projects/not.valid`, {
      method: "DELETE",
    });
    assert.equal(malformed.status, 404);
  } finally {
    await server.close();
  }
});

test("returns 401 before project handlers for unauthenticated requests", async () => {
  const server = await createTestServer(null, createService());

  try {
    const response = await fetch(`${server.url}/api/projects`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error.code, "UNAUTHORIZED");
  } finally {
    await server.close();
  }
});
