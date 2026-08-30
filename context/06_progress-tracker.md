# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Authentication and editor workspace UI

## Current Goal

- Establish a polished dark workspace experience around the Clerk-authenticated frontend and reusable editor chrome.

## Completed

- Approved the React/Vite/JavaScript, Express, Prisma/PostgreSQL architecture.
- Updated architecture, UI, code standards, workflow, and design-system context for the new stack.
- Created the `apps/web`, `apps/api`, `apps/worker`, `packages/database`, and `packages/shared` folder structure.
- Added npm workspace manifests and local startup environment examples.
- Added the Vite frontend boot and React Router root route.
- Added Express liveness and database health endpoints.
- Added the initial Prisma `Project` model and PostgreSQL migration.
- Confirmed the frontend production build and Prisma schema validation/client generation.
- Confirmed the Express liveness endpoint and Vite-to-Express development proxy.
- Configured Tailwind CSS v4 and shadcn/ui for the frontend with the existing dark theme tokens.
- Added shadcn Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea primitives.
- Added Lucide React and the shared `cn()` class merging helper.
- Added the controlled editor navbar and floating project sidebar components.
- Added the reusable editor dialog pattern with title, description, content, and footer support.
- Confirmed the frontend production build after adding the editor chrome foundation.
- Installed `@clerk/react`, `@clerk/ui`, and `@clerk/express`.
- Added documented Clerk environment contracts for the web and API applications.
- Added the Clerk provider, dark/shadcn appearance configuration, auth pages, redirects, and protected editor route.
- Added Clerk's default `UserButton` to the editor navbar.
- Added Express Clerk middleware, API authentication guard, authorized-party validation, and bearer-token CORS support.
- Added an authenticated frontend API client helper that sends Clerk session tokens as bearer tokens.
- Added API middleware tests for unauthenticated and authenticated requests.
- Revised the auth feature specification and architecture context with the frontend/API security boundary.
- Added a reusable Ghost AI brand mark for auth and editor surfaces.
- Refined Clerk auth screens with responsive hierarchy, token-based appearance overrides, and a compact developer-tool visual language.
- Extended the prebuilt Clerk sign-in and sign-up appearance with Ghost AI surface, input, focus, state, social button, and footer styling.
- Refined the editor navbar and project sidebar with product identity, status indicators, responsive overlay behavior, and richer empty states.
- Added an intentional responsive editor workspace empty state without inventing project-management behavior.
- Added `docs/architecture/ghost-ai-architecture.md` with the approved database plan, storage boundaries, flowchart, UML class diagram, and sequence diagram.
- Recorded the approved collaborator, canvas snapshot, AI provider, and current-spec decisions in the architecture context.
- Implemented the mock-only project dialogs, slug preview, ownership-gated sidebar actions, and create-only editor home from `context/feature_specs/04-project-dialogs.md`.
- Installed Prisma 7.10.0, `@prisma/adapter-pg`, `pg`, `dotenv`, and Prisma script tooling in `packages/database`.
- Linked the supplied Prisma Postgres connection through the ignored workspace-root `.env` file.
- Extended `Project`, added `ProjectCollaborator`, and applied the follow-up Prisma migration to Prisma Postgres.
- Added the Prisma 7 config, generated client, deterministic seed script, and one-read verification script.
- Added `context/07-security-plan.md` with the security threat model, release blockers, implementation phases, authorization matrix, verification gates, and production security requirements.
- Added fail-closed API environment validation for allowed environments, exact origins, body limits, rate limits, and trusted proxy hops.
- Added API security headers, request IDs, authenticated and public rate limiting, bounded JSON parsing, redacted JSON error handling, and safer health-check logging.
- Updated API startup logging to structured, non-sensitive events.
- Strengthened the API auth guard to require an explicit bearer Clerk session token and expose the verified user ID to downstream authorization services.
- Hardened frontend API requests and Clerk redirect configuration against credentialed requests, external redirects, and unsafe API targets.
- Added API regression tests for configuration validation, token types, request IDs, rate limiting, payload limits, and error redaction.
- Reordered authenticated API rate limiting ahead of authentication so unauthenticated abuse is rate-limited, with a regression test covering the `401` then `429` sequence.
- Added a configurable global API rate limit before Clerk middleware so every request is bounded before authentication processing.
- Expanded the project API specification with Express routes, request and response contracts, authorization semantics, deletion behavior, and security decisions.
- Added shared Zod validation schemas for project names and IDs, including strict unknown-field rejection and the 80-character name limit.
- Implemented the backend project module with routes, thin controllers, services, repository persistence, centralized owner authorization, bounded project listing, and safe response field selection.
- Registered project routes with a route-specific 10 KB JSON body limit and consistent redacted API errors.
- Added project API tests covering owned/shared listing, creation defaults, validation, owner mutations, collaborator authorization, inaccessible IDs, archived visibility, and unauthenticated requests.
- Updated the Prisma client runtime import for the generated TypeScript client and preloaded `tsx` for API tests.
- Added TanStack Query as the frontend server-state layer with user-scoped project queries, mutation invalidation, and protected-cache clearing on sign-out or user changes.
- Added an authenticated project API service with normalized errors, cancellation support, and safe `204` handling.
- Replaced mock project dialog state with real project query/mutation actions, including loading, retry, validation, and mutation error states.
- Added `/editor/:projectId` workspace navigation using the server-generated project CUID and removed slug-based room ID assumptions.
- Wired the editor sidebar and dialogs to real project data and API mutations.
- Updated the wire-editor-home feature specification, architecture context, and React code standards for the React/Vite data-fetching model.
- Changed the desktop project sidebar to slide into its own layout column beside the workspace with coordinated width and transform transitions while preserving the mobile drawer behavior.
- Set the sidebar to open by default on desktop-sized first loads while keeping it closed by default on mobile.
- Added the membership-scoped `GET /api/projects/:projectId` endpoint with non-enumerating missing and unauthorized responses and regression coverage.
- Implemented the project-aware editor shell with active-project loading, retry, access-denied, and session-error states, plus the responsive AI placeholder panel and disabled Share action.
- Verified the editor workspace implementation with `npm test --workspace=@ghost-ai/api` and `npm run build:web`; all 20 API tests and the frontend production build pass. The build reports the existing large JavaScript chunk warning.

## In Progress

- Interactive sign-in/sign-up and a valid browser session token still need to be smoke-tested against the existing Clerk application.

## Next Up

- Run Clerk's setup doctor when the CLI is available on the development machine and complete signed-in browser/API smoke checks.
- Complete signed-in browser/API smoke checks for the Share dialog and Clerk directory lookup.
- Resolve the remaining security decisions in `context/07-security-plan.md` before implementing resource integrations and product endpoints that depend on them.

## Open Questions

- The production frontend and API origins still need to be recorded in deployment configuration and the existing Clerk application.
- Security decisions listed in `context/07-security-plan.md` still need confirmation before implementing the related product boundaries, including archived-project read-only behavior and production quotas.

## Architecture Decisions

- Frontend, API, and Trigger.dev worker are separate deployable applications in one workspace.
- Clerk, Liveblocks, Trigger.dev, and Vercel Blob remain part of the architecture.
- Plain JavaScript is used throughout the application.
- API features use modular boundaries under `apps/api/src/modules`.
- TanStack Query owns authenticated API server state in the React frontend; dialog and form drafts remain local React state.
- Clerk is the identity source; API requests use bearer session tokens and resource ownership uses Clerk user IDs.
- Protected API requests require verified Clerk session tokens; the API uses exact-origin CORS, bounded JSON parsing, security headers, request IDs, and rate limits.
- API errors are returned as redacted JSON responses, and security-relevant logs exclude credentials and request content.
- Project listing is owner-or-collaborator scoped; project rename and hard deletion are owner-only, with unrelated project IDs hidden as `404`.
- Project detail reads are owner-or-collaborator scoped and use the same non-enumerating `404` behavior for unrelated or missing IDs.
- `/api/health` is public, while all other API routes are protected by default after Clerk middleware.
- Prisma database access is shared by the API and worker through `packages/database`.
- Prisma is pinned to 7.10.0 for the current `schema.prisma` and driver-adapter workflow; Prisma 8's contract workflow is deferred.
- Prisma Postgres uses the direct `@prisma/adapter-pg` path; Accelerate is not configured.
- Collaborators use direct Clerk user IDs in a project relationship; the share API resolves existing users from normalized email input, and invitation workflows remain out of scope.
- Canvas snapshots use an explicit Save action and store only a Vercel Blob URL in `Project.canvasJsonPath`.
- AI worker tasks call a provider adapter rather than a vendor-specific implementation.
- The MVP stores one current specification per project; task runs remain durable relational records.

## Session Notes

- The repository began with context files only. This session added the workspace scaffold and a minimal startup vertical slice, without product features.
- The local PostgreSQL service is running on port 5432, but password authentication prevents migration/connection verification until credentials are configured in `apps/api/.env`.
- Prisma Postgres is linked and the relational schema, migration, seed, and one-read verification completed successfully.
- This session added the shadcn/Tailwind frontend foundation and reusable editor chrome without changing the existing startup route or server boundaries.
- This session added the Clerk frontend/API foundation and kept the existing health endpoint public for startup and liveness checks.
- The API environment loader resolves the workspace-root `.env` for the linked database and `apps/api/.env` for application settings.
- Automated frontend build, API middleware tests, public health smoke checks, and unauthenticated/malformed-token API checks pass.
- `npx clerk@latest doctor --json` could not run because the Clerk CLI package does not provide a Windows `win32-x64` binary in this environment.
- This session improved the authenticated auth and editor UI while preserving the existing dark token system and generated shadcn primitives.
- This session aligned the Clerk prebuilt sign-in and sign-up forms with the shared dark workspace tokens and verified the frontend production build.
- This session aligned the Prisma feature specification and architecture notes with the implemented relational model and Prisma Postgres setup.
- The project-dialogs feature was initially scoped to mock-only project list mutations; the follow-up wire-editor-home feature now adds project persistence, routing, and project opening.
- The mock project dialogs and sidebar actions were implemented and the frontend production build passed.
- The wire-editor-home implementation uses TanStack Query because the Vite frontend has no React Server Component or server-side page-fetching boundary.
- The project CUID is the canonical workspace identifier; Liveblocks room identity remains a server-derived collaboration concern.
- The project sidebar was refined so the `My Projects` and `Shared` tabs sit directly above their project lists.
- The project tabs now use controlled state with an explicit active style when tapped.
- The sidebar tabs were explicitly set to a vertical layout so tab controls render above their selected project list.
- Sidebar actions now preserve the open sidebar while Create, Rename, or Delete dialogs are active.
- Project dialog name inputs now use explicit readable text, placeholder, background, and focus colors.
- The desktop sidebar layout change was verified with `npm run build:web`.
- Security baseline tests, frontend build, and Prisma validation pass. `npm audit --omit=dev` still reports 22 dependency vulnerabilities and requires a separate reachability review before applying breaking fixes.
- Revised `context/feature_specs/08-editor-workspace-shell.md` to match the React/Vite SPA architecture, canonical project route, API-authoritative access checks, and explicitly scoped placeholder controls. Documentation validation with `git diff --check` passes.
- Aligned the share feature specification, architecture records, Prisma guidance, security plan, and design prototype around existing Clerk users resolved by email while storing only Clerk user IDs.
- Implemented the collaborators API with bounded membership reads, server-side Clerk directory enrichment, owner-only transactional add/remove actions, duplicate and self-add protection, safe directory errors, collaborator limits, and audit events.
- Added collaborator API coverage for enriched lists, normalized email adds, duplicate/self/unknown users, owner authorization, inaccessible projects, unauthenticated requests, invalid input, and Clerk directory failures.
- Added the project-aware Share dialog with owner-only add/remove/copy controls, read-only collaborator access, responsive member states, removal confirmation, clipboard feedback, TanStack Query invalidation, and focus return.
- Verified `npm test --workspace=@ghost-ai/api`, `npm run build:web`, `npx prisma validate --schema packages/database/prisma/schema.prisma`, and `git diff --check`; all pass. The frontend build retains the existing large JavaScript chunk warning.
- Reworked collaborator routes to use merged parent parameters and mounted the router together with its collaborator-specific limiter at `/api/projects/:projectId/collaborators`; the public collaborator URLs are unchanged.
- Added a regression test proving both collaborator list and removal paths are covered by the shared collaborator limiter. The API suite now passes all 26 tests.
- Added the Liveblocks configuration, server and browser clients, project-authorized room token route, deterministic cursor colors, and collaboration API regression coverage. `npm test --workspace=@ghost-ai/api`, `npm run build:web`, and `git diff --check` pass; the web build retains the existing large JavaScript chunk warning.
- Removed duplicate `@liveblocks/node`, `@liveblocks/client`, and `@liveblocks/react` entries from `apps/api/package.json` and `apps/web/package.json`; verified `package-lock.json` consistency with repeated `npm install` runs producing a byte-identical lockfile.
- Hardened `getLiveblocksClient()` to source its secret from the validated `env.liveblocks.secretKey` instead of raw `process.env.LIVEBLOCKS_SECRET_KEY`, dropping the injectable `secret` parameter that bypassed validation. It now throws on a missing/blank secret before memoizing, so a misconfigured client can never be cached or reused. All 32 API tests pass; no caller changes were required.
- Revised `context/feature_specs/11-base-canvas.md` to align the collaborative canvas scope with the canonical project ID, JavaScript shared-contract conventions, Liveblocks/React Flow dependency boundary, room hydration behavior, responsive and accessible workspace requirements, security constraints, and explicit verification criteria.
- Implemented the Liveblocks-backed React Flow canvas foundation with shared JavaScript canvas contracts, project-ID room joining, suspense/error states, loose connections, fit view, minimap, and dot background. API tests (32), frontend production build, and `git diff --check` pass; the existing large frontend chunk warning remains.
- Updated Liveblocks session permissions from legacy `room:read`/`room:write` aliases to the current `*:read`/`*:write` syntax after provider authorization rejected the legacy aliases.
- Corrected the Liveblocks session permission to the single supported `*:write` permission after the provider rejected combining `*:read` and `*:write`.
