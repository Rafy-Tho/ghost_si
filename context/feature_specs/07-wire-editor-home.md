# Wire Editor Home

Wire the editor home sidebar and dialogs to the authenticated project API.

### Frontend Data Fetching

The frontend is a client-rendered React + Vite SPA. It does not use React Server Components or server-side page fetching.

Use `@tanstack/react-query` for API server state:

- Mount `QueryClientProvider` inside `ClerkProvider`.
- Keep the query client in a stable module-level instance.
- Clear the query cache when the Clerk user signs out or changes.
- Fetch projects through a feature API service, not presentational components.
- Enable the projects query only after Clerk authentication has loaded and a user ID exists.
- Use a query key scoped to the authenticated user, such as `["projects", userId]`.
- Pass the query cancellation signal to `fetch`.
- Show loading, empty, error, and retry states in the sidebar and active workspace view.
- Do not fetch projects with `useEffect`, duplicate project lists in local state, or force a browser reload after mutations.

The query service must use the authenticated API client and return parsed payloads. Non-2xx responses must reject with a normalized error containing the HTTP status, API error code, and request ID. A `204` response must not be parsed as JSON.

### Project API Service

Create `apps/web/src/features/projects/project-api.js` with methods for:

- `GET /api/projects`
- `POST /api/projects` with `{ name }`
- `PATCH /api/projects/:projectId` with `{ name }`
- `DELETE /api/projects/:projectId`

Encode project IDs when constructing parameterized URLs. The API response is the source of truth; do not add a frontend-only `slug` field.

### `useProjects`

Create a query hook in `apps/web/src/features/projects/use-projects.js` that:

- obtains `getToken` and `userId` from Clerk
- calls the project API service through `useQuery`
- returns the project list, loading state, error state, and refetch handler
- exposes an empty list while the query has no data

### `useProjectActions`

Create `apps/web/src/features/projects/use-project-actions.js`. It owns ephemeral dialog and form state, while project data and mutations use TanStack Query.

The hook must expose:

- create, rename, and delete dialog open/close handlers
- the current dialog type and selected project snapshot
- the draft project name and validation error
- a disabled/valid submission state
- project query data and loading/error/retry state
- mutation loading state
- create, rename, and delete submit handlers

#### Create

- Reset the name and validation state when opening.
- Trim the name before sending it.
- Require a non-empty name no longer than 80 characters.
- Call `POST /api/projects`.
- Use the returned server-generated `project.id`.
- Update or invalidate the projects query after success.
- Navigate to `/editor/:projectId` using the returned project ID.
- Keep the dialog open and show a safe error when the request fails.

Do not generate a client project ID, short suffix, slug, or Liveblocks room ID.

#### Rename

- Store the target project ID and current project snapshot.
- Prefill the trimmed current name.
- Call `PATCH /api/projects/:projectId`.
- Update or invalidate the projects query after success.
- Close the dialog only after success.
- Keep the dialog open and show a safe error when the request fails.

#### Delete

- Store the target project snapshot.
- Call `DELETE /api/projects/:projectId`.
- Treat the successful `204` response as having no body.
- Remove or invalidate the project query after success.
- Navigate to `/editor` when deleting the active workspace.
- Keep the current route when deleting another project.
- Keep the dialog open and show a safe error when the request fails.

Client-side owner checks are only a UI convenience. The API remains authoritative for authorization.

### Workspace Identifiers and Routes

- `/editor` is the project home and project list view.
- `/editor/:projectId` is the active workspace route.
- The database-generated project CUID is the canonical project and workspace identifier.
- Existing project rows navigate to `/editor/:projectId` and visually identify the active project.
- Project responses do not contain `slug`; display the project ID or another non-authoritative presentation of it.
- The Liveblocks integration must derive its room ID from the authorized project ID on the server. The browser must not choose an arbitrary room ID.
- This feature does not join a Liveblocks room because that belongs to the collaboration feature.

### Wiring

Connect the query/action hooks to the sidebar and dialogs:

- The sidebar renders real owned and shared project data.
- Owned projects show rename and delete controls.
- Collaborator projects do not show owner-only controls.
- Project rows are accessible links to the active workspace route.
- The create dialog shows that the workspace identifier is assigned by the server.
- The rename dialog pre-fills the current project name.
- The delete dialog shows the project name and permanent-delete warning.
- Dialogs remain open while a mutation is pending and close only after success.

### Check When Done

- `npm run build:web` passes.
- The signed-in editor loads owned and shared projects from the API.
- Loading, empty, error, and retry states are usable.
- Create sends the trimmed name and navigates using the returned project CUID.
- Existing project links open `/editor/:projectId`.
- Rename sends the correct Express parameter route and updates the cached list.
- Delete handles `204`, removes the project, and redirects only when deleting the active workspace.
- API errors do not expose tokens, prompts, internal details, or raw response bodies.
