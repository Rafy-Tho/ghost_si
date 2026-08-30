# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## JavaScript

- Use plain JavaScript with ES modules and `.js` or `.jsx` files.
- Validate unknown external input at API and integration boundaries before trusting it.
- Use JSDoc only where it materially improves editor support or documents a complex contract.
- Keep shared canvas and API contracts in `packages/shared`.

## React and React Router

- Keep route definitions and protected-route behavior in the frontend routing layer.
- Keep browser-side API calls in frontend services rather than directly in presentational components.
- Keep feature behavior in feature modules and reusable UI in shared components.
- Use TanStack Query for API server state, caching, loading/error states, and mutations; use local React state for ephemeral UI state only.
- Keep query keys scoped to the authenticated Clerk user and clear cached protected data on sign-out or user changes.
- Feature API services must parse successful responses, reject non-2xx responses with normalized errors, pass cancellation signals to fetch, and handle `204` responses without JSON parsing.
- Invalidate or update query cache after successful mutations instead of forcing browser reloads.

## Express API

- Keep `app.js` responsible for middleware and route registration; keep `server.js` responsible for starting the process.
- Validate and parse request input before business logic runs.
- Enforce Clerk authentication and project membership before any mutation.
- Keep controllers thin and push business logic into services and repositories.
- Return consistent, predictable response and error shapes.
- Long-running work belongs in Trigger.dev tasks, not Express request handlers.

## Styling

- Use CSS custom property tokens defined in `globals.css` — no raw Tailwind color classes like `zinc-*` or hardcoded hex values.
- Reference tokens through their Tailwind utility names: `bg-base`, `text-copy-primary`, `border-surface-border`, `text-brand`, etc.
- Maintain the border radius scale: `rounded-xl` for small elements, `rounded-2xl` for cards, `rounded-3xl` for modals.

## API Routes

- Validate and parse request input before any logic runs.
- Enforce auth and project ownership checks before any mutation.
- Return consistent, predictable response shapes.
- Keep route handlers thin — push complexity into shared modules or background tasks.

## Data and Storage

- Project metadata and relationships belong in PostgreSQL via Prisma.
- Canvas snapshots and generated specs belong in Vercel Blob; Prisma stores only the Blob URL reference.
- Do not store large generated content directly in the database.
- Task run records are first-class relational data — treat ownership and run IDs as verified before any token issuance.

## File Organization

- `apps/web/src/features/` — frontend feature behavior and screens.
- `apps/web/src/components/` — frontend UI composition only; no business logic.
- `apps/api/src/modules/` — API feature modules containing routes, controllers, services, repositories, and validators.
- `apps/api/src/integrations/` — Clerk, Liveblocks, Trigger.dev, and Vercel Blob adapters.
- `apps/worker/src/tasks/` — durable Trigger.dev tasks and AI workflows.
- `packages/database/` — Prisma schema and database client.
- `packages/shared/` — shared JavaScript contracts and constants.
- Name files after the responsibility they contain, not the technology.
