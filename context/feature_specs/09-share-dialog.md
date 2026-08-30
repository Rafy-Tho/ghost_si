# Share Dialog And Collaborators

## Goal

Add project-member visibility and owner-managed collaborator access to the authenticated project workspace. This feature adds existing Clerk users to a project by email; it does not implement email invitations.

The project ID remains the database-generated project CUID and the canonical workspace identifier.

## Identity And Membership

- The email entered by an owner is lookup input only.
- The API normalizes the email, looks up an existing Clerk user through the Clerk Backend API, and derives that user's immutable Clerk `userId`.
- `ProjectCollaborator.userId` remains the canonical stored identity. Store no email-only collaborator rows, invitation tokens, pending state, or local user records.
- An email that does not match an existing Clerk user is rejected and does not create project access.
- Clerk profile data is resolved on the server and returned as presentation data; it is not used as the authorization source.
- If a previously added Clerk user is no longer available, keep the membership row but return a safe `Former member` display state without granting or removing access based on profile data.

This feature does not send invitation emails. Product behavior for users without an existing Clerk account is intentionally out of scope.

## Share Dialog

Add an enabled `Share` button to the editor navbar when an active project is loaded. On the `/editor` project home with no active project, keep the control disabled with an accessible label such as `Open a project to share it`.

The dialog uses the existing `EditorDialog` and shadcn/ui primitives. It must be responsive, keyboard accessible, and return focus to the Share button after closing.

### Owner View

Owners can:

- view the project owner and current collaborators
- add an existing Clerk user by email
- remove collaborators after an in-dialog destructive confirmation
- copy the private project URL with temporary `Copied!` feedback

### Collaborator View

Collaborators can:

- view the project owner and current collaborators
- use no add, remove, or access-management controls

The read-only behavior applies to the Share dialog only. Collaborators retain the normal project and collaborative-canvas permissions defined by the architecture and authorization context.

The copied URL is the private canonical route `/editor/{projectId}`. It does not contain a room ID, slug, access token, or public invitation token. Authentication and project membership remain required when the URL is opened. Only owners receive the copy-link action in this feature.

## Collaborator Display Data

The collaborators API returns safe display fields for project members:

```json
{
  "userId": "user_123",
  "email": "person@example.com",
  "displayName": "Person Example",
  "avatarUrl": "https://img.clerk.com/...",
  "status": "active",
  "addedAt": "2026-08-28T00:00:00.000Z"
}
```

- `email` and `avatarUrl` may be `null`.
- `status` is `active` or `unavailable`.
- An unavailable user uses `displayName: "Former member"` and does not expose a raw Clerk error.
- `displayName` uses the Clerk full name, username, or current email in that order when available.
- The owner is returned separately with `addedAt: null` and is listed before collaborators.
- Members may see the email, display name, avatar, and membership status of users in the same project.
- Avatar rendering must include useful alternative text and an initials or neutral fallback when the image is missing.

## API Routes

All routes are protected by the existing Clerk bearer-token middleware, authenticated rate limiter, JSON limits, and project authorization.

- `GET /api/projects/:projectId/collaborators` lists the owner and collaborators for an accessible project.
- `POST /api/projects/:projectId/collaborators` adds an existing Clerk user. The body is `{ "email": "person@example.com" }`.
- `DELETE /api/projects/:projectId/collaborators/:userId` removes one collaborator.

### Authorization

- The acting user always comes from the verified Clerk session token.
- Project members may read the collaborator list.
- Only the project owner may add or remove collaborators.
- Missing and inaccessible project IDs return the existing non-enumerating `404` response.
- A known collaborator attempting an add or remove action receives `403`.
- The project owner cannot be added as a collaborator.
- A duplicate collaborator returns `409` and does not create another row.
- Removing a non-member returns `404`.
- The server rechecks owner authorization inside the mutation transaction.
- Archived projects currently follow the existing project API semantics: accessible members can read them and owners can manage collaborators. A future archive read-only policy must explicitly restrict these actions rather than being introduced implicitly by this feature.

### Responses

Successful list response:

```json
{
  "owner": {
    "userId": "user_owner",
    "email": "owner@example.com",
    "displayName": "Project Owner",
    "avatarUrl": null,
    "status": "active",
    "addedAt": null
  },
  "collaborators": []
}
```

- `GET` returns `200`.
- `POST` returns `201` with `{ "collaborator": { ... } }`.
- `DELETE` returns `204` with an empty body.
- Collaborator results are ordered by `createdAt` ascending and bounded by a documented maximum of 100 members.

Required safe errors include:

- `400 VALIDATION_ERROR` for malformed bodies or invalid email values
- `401 UNAUTHORIZED` for missing or invalid Clerk authentication
- `403 FORBIDDEN` for a collaborator attempting owner-only management
- `404 NOT_FOUND` for missing, inaccessible, or malformed project/member IDs, and for missing collaborators
- `409 COLLABORATOR_EXISTS` for duplicates or `CANNOT_ADD_SELF` when the owner enters their own email
- `422 USER_NOT_FOUND` when the email is not associated with an existing Clerk user
- `422 COLLABORATOR_LIMIT_REACHED` when the project has 100 collaborators
- `413 PAYLOAD_TOO_LARGE` for oversized request bodies
- `503 DIRECTORY_UNAVAILABLE` when the Clerk lookup service cannot be reached

All errors use the existing redacted JSON error shape and never include Clerk provider responses, credentials, or request secrets.

## Clerk Backend API

- Clerk Backend API access is server-only through an integration adapter under `apps/api/src/integrations/clerk`.
- Email lookup must be exact after trimming and case normalization; the API must not use partial matches.
- Profile reads must be bounded, timeout-aware, and mapped to safe application errors.
- User profile data should be read by Clerk user ID when enriching the collaborator list.
- Clerk lookup failures are distinct from a user-not-found result.
- Emails, prompts, tokens, and provider responses must not be written to logs.

## Frontend State And UX

- Use an authenticated frontend API service in `apps/web/src/features/collaborators/`.
- Use TanStack Query for the collaborator list and mutation state, with query keys scoped by Clerk user ID and project ID.
- Fetch the list when the Share dialog opens and invalidate it after a successful add or remove.
- Keep the email draft, removal confirmation target, and copied feedback in local React state.
- Render loading skeletons, an empty collaborator state, retryable errors, validation errors, duplicate-member errors, and mutation loading states.
- Disable add submission for empty or obviously invalid email input and while a mutation is pending.
- Show an accessible `aria-live` status for `Copied!` and clipboard failures.
- Copy only after `navigator.clipboard.writeText()` succeeds; do not place tokens or alternate access data on the clipboard.
- Use visible focus states, labeled icon-only actions, Escape handling, and focus return through the existing dialog primitive.

## Implementation Boundaries

Expected locations:

- `apps/api/src/modules/collaborators/`
- `apps/api/src/integrations/clerk/`
- `apps/web/src/features/collaborators/`
- `apps/web/src/components/editor/editor-navbar.jsx`
- `apps/web/src/pages/EditorPage.jsx`

Keep controllers thin, put database access in the collaborators repository, use the centralized project authorization capability, and do not modify generated shadcn/ui primitives.

## Security And Tests

API tests must cover:

- owner list, add, duplicate, self-add, and remove behavior
- collaborator list access and forbidden mutations
- unrelated, missing, malformed, archived, and cross-project IDs
- unauthenticated requests
- invalid and normalized email input
- unknown Clerk users, deleted Clerk users, and Clerk service failure
- transaction-safe duplicate and removal behavior
- bounded collaborator responses and safe error fields

Frontend verification must cover the owner and collaborator views, loading/error/empty states, removal confirmation, clipboard success/failure, keyboard access, and focus return.

Run `npm test --workspace=@ghost-ai/api`, `npm run build:web`, and `npx prisma validate --schema packages/database/prisma/schema.prisma` before marking the feature complete. Update `context/06_progress-tracker.md` with the actual results.

## Out Of Scope

- Email delivery or invitation links
- Pending invitations, invitation acceptance, or invitation expiration
- A local user table
- Collaborator roles beyond owner and collaborator
- Public share links or anonymous project access
- Immediate room-session revocation beyond the existing Liveblocks token policy
