# Editor Workspace Shell

## Goal

Build the `/editor/:projectId` workspace route in the React + Vite frontend. This feature establishes the project-aware editor shell only. Do not add canvas logic, real-time collaboration, AI generation, or sharing behavior.

The database-generated project CUID is the canonical `projectId`. Do not use a room ID in the browser or route. Liveblocks room identity remains a later server-derived collaboration concern.

## Route And Authentication

- Register or preserve `/editor/:projectId` in the existing React Router configuration.
- Keep the existing `ProtectedRoute` as the frontend authentication guard.
- Unauthenticated users are redirected to `/sign-in` by `ProtectedRoute`.
- Frontend route protection is navigation UX only. The API remains authoritative for project access.
- Do not implement server components, server-side page fetching, Next.js route conventions, or TypeScript files.

## Project Access

The active project must be loaded through an authenticated API request before project-specific workspace content is shown.

- Add or depend on `GET /api/projects/:projectId` in the project API feature before implementing this shell.
- The endpoint must authorize the verified Clerk user as either the project owner or a collaborator.
- The endpoint returns `200` with `{ project: { ... } }` using the existing safe project response fields.
- Missing and inaccessible projects both return the existing non-enumerating `404` response.
- The frontend must not use a client-provided user ID, email address, room ID, or local project list as an authorization decision.
- Use the existing authenticated API client and TanStack Query for the active project request.
- Do not create a `project-access.js` helper that performs browser-side authorization or reads primary email for access checks.

If the project-detail endpoint is intentionally deferred, the implementation must explicitly document that the bounded `GET /api/projects` query is being used as a temporary active-project lookup. The detail endpoint is preferred because the project list is capped and may be stale.

## Access Denied

Create `apps/web/src/components/editor/access-denied.jsx` with:

- a centered full-height layout
- a Lucide `Lock` icon
- a short, generic message such as `This workspace is unavailable.`
- no project ID, project name, or explanation that distinguishes missing from unauthorized projects
- an accessible link back to `/editor`, labeled `Back to projects`
- visible focus styling and responsive spacing

Use `AccessDenied` for both an inaccessible project and a non-existent project after the API has completed successfully. Network failures and expired sessions use their own retry or authentication states instead.

## Workspace Layout

Build on the existing `EditorPage`, `EditorNavbar`, and `ProjectSidebar` components.

- Use a full-viewport dark workspace that accounts for the fixed navbar height.
- The navbar displays the active project name and retains the existing sidebar toggle and user controls.
- The desktop project sidebar remains an in-flow column that pushes the workspace area.
- The mobile project sidebar remains a drawer with a scrim, outside-click dismissal, Escape handling, and focus return to its toggle.
- Pass the active `projectId` to `ProjectSidebar` so the current project is highlighted.
- The central canvas placeholder fills the remaining available space and displays a concise message that the collaborative canvas will be connected later.
- The canvas placeholder must not initialize React Flow, Liveblocks, or any persistence behavior.
- Add a right-side AI placeholder panel controlled by local UI state only.

## Navbar Actions

### Share

- Render a clearly labeled, project-aware Share control in the navbar.
- Keep it disabled with an accessible label such as `Open a project to share it` when the `/editor` home has no active project.
- The active-project dialog, collaborator management, and clipboard behavior are defined in `09-share-dialog.md`.

### AI Sidebar

- Render an icon-only toggle with a tooltip and visible focus state.
- Expose `aria-controls` and `aria-expanded` for the AI placeholder panel.
- On desktop, the panel slides in from the right without changing the canvas data.
- On mobile, the panel behaves as a drawer with a scrim, outside-click dismissal, Escape handling, and focus return to the toggle.
- The panel contains only a placeholder message for future AI chat.
- No AI request, task run, prompt state, or generated content is part of this feature.

## UI States

Define and render these states without exposing sensitive details:

- authentication loading: handled by the existing `ProtectedRoute`
- active project loading: accessible loading status or skeleton
- active project request failure: safe error message with retry
- active project missing or inaccessible: `AccessDenied`
- active project loaded: complete shell with project name and canvas placeholder

Use TanStack Query for server state and local React state only for sidebar, AI panel, and dialog visibility. Do not duplicate project lists in local state or fetch project data with `useEffect`.

Preserve the existing project sidebar and project-dialog behavior from the project features. Do not introduce a second project-management implementation.

## Implementation Boundaries

Expected frontend locations:

- `apps/web/src/pages/EditorPage.jsx`
- `apps/web/src/components/editor/access-denied.jsx`
- `apps/web/src/components/editor/editor-navbar.jsx`
- `apps/web/src/components/editor/project-sidebar.jsx`
- `apps/web/src/features/projects/project-api.js`
- `apps/web/src/features/projects/use-project.js`

Use app-level components for workspace-specific styling. Do not modify generated shadcn/ui primitives. Keep API access in feature services and keep authorization in the API.

The project-detail API contract belongs in `context/feature_specs/06-project-apis.md` and must be updated before its implementation if it is not already present.

## Out Of Scope

- React Flow nodes, edges, handles, shapes, or canvas editing
- Liveblocks room joining, tokens, presence, cursors, or persistence
- AI chat, architecture generation, or Trigger.dev task runs
- Share dialog behavior, collaborator management, or clipboard behavior beyond the project-aware navbar control
- Canvas snapshots, Blob storage, or spec generation
- Project authorization based on frontend state

## Check When Done

- `/editor/:projectId` builds successfully in the Vite frontend.
- The route uses the existing `ProtectedRoute` and React Router conventions.
- The active project is loaded through the authenticated API client and TanStack Query.
- Missing and inaccessible projects render the same `AccessDenied` component.
- API/network failures render a safe retry state instead of `AccessDenied`.
- The active project name appears in the navbar and the sidebar highlights the active project.
- The desktop sidebar pushes the workspace and mobile drawers remain keyboard accessible.
- The AI placeholder toggle works without AI or collaboration calls.
- The Share control is disabled only on `/editor` without an active project, and the active-project behavior is implemented by the share-dialog feature.
- No room ID, server component, TypeScript, Liveblocks, or canvas logic is introduced.
- `npm run build:web` passes.
- If the project-detail endpoint is added in the same delivery, `npm run test --workspace=@ghost-ai/api` passes.
