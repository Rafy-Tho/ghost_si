# Architecture Context

## Stack

| Layer            | Technology               | Role                                                           |
| ---------------- | ------------------------ | -------------------------------------------------------------- |
| Frontend         | React + Vite + JavaScript | Browser application and build tooling                          |
| Frontend routing | React Router              | Client-side navigation and protected routes                    |
| API              | Node.js + Express         | HTTP API, authorization, and request orchestration              |
| UI               | Tailwind + shadcn/ui      | Component composition and styling                              |
| Auth             | Clerk                     | User identity and API authorization                            |
| Database         | Prisma + PostgreSQL       | Relational metadata: projects, collaborators, specs, task runs |
| Canvas           | Liveblocks + React Flow   | Real-time collaborative canvas, presence, and cursors         |
| Background tasks | Trigger.dev              | Durable AI generation workflows                                |
| Artifact storage | Vercel Blob               | Canvas snapshots and generated Markdown specs                  |

The frontend, API, and Trigger.dev worker are separate deployable applications in one workspace.

## System Boundaries

- `apps/web/src` — React UI, React Router, browser-side Clerk and Liveblocks clients, and API calls.
- `apps/api/src` — Express application, request validation, Clerk authorization middleware, ownership checks, API routes, and persistence orchestration.
- `apps/worker/src` — Trigger.dev tasks for AI architecture generation and Markdown spec generation.
- `packages/database` — Prisma schema, generated client, and database access shared by the API and worker.
- `packages/shared` — Shared JavaScript constants, canvas contracts, validation schemas, and API-safe utilities.
- `data` — Legacy local directory. Not used for new artifacts.

Business functionality is organized as feature modules. Each API module owns its routes, controllers, services, repositories, and validation rules.

## Storage Model

- **Database**: metadata, ownership, relationships, generated spec records, and task run records in PostgreSQL via Prisma.
- **Liveblocks**: authoritative active collaborative room state, presence, cursors, and in-session canvas edits.
- **Vercel Blob**: persisted canvas snapshots at `canvas/{projectId}.json` and specs at `specs/{projectId}/{specId}.md`.
- Prisma stores the Vercel Blob URL reference in `canvasJsonPath` or `filePath`, not large generated content.

## Auth and Collaboration Model

- The React frontend uses Clerk for sign-in and identity.
- Express validates Clerk credentials with server-side Clerk middleware before protected handlers run.
- Every project has a single owner identified by Clerk user ID.
- Projects can include additional collaborators.
- Only the owner or a collaborator can mutate project resources.
- Express issues Liveblocks room tokens only after verifying project membership.
- The frontend and API are deployed separately, so production CORS and Clerk origins must be explicitly configured.

## Starter System Designs

- Prebuilt templates are static canvas snapshots stored in the frontend codebase or shared package.
- Templates are loaded into the active Liveblocks room when a user imports one.
- Import can occur on canvas creation or from within the editor at any time.
- Template data follows the same node/edge schema as user-created canvas content.
- Templates do not require a separate database record; they are resolved by template ID at import time.

## AI Generation Model

### Design Generation

- Input: user prompt, project context, and current canvas state.
- Execution: API validates the request and starts a durable Trigger.dev task.
- Output: structured node and edge updates written into the shared Liveblocks room.
- Task status and ownership are persisted in PostgreSQL.

### Spec Generation

- Input: current canvas graph and project context.
- Execution: API starts a durable Trigger.dev task.
- Output: Markdown technical spec saved to Vercel Blob and linked to the project in PostgreSQL.

## Invariants

1. Express request handlers do not run long-lived AI work; that belongs in Trigger.dev tasks.
2. Metadata and large generated artifacts are stored in separate layers.
3. Clerk authentication and ownership are enforced at every protected mutation boundary.
4. Browser-only UI and real-time behavior stay in the React frontend.
5. Prisma database access is limited to the API and worker applications.
6. The canvas schema must remain consistent between user-created content and imported templates.
