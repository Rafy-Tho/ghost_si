# Project API Routes

## Goal

Build the backend project API routes only. Do not wire the frontend in this feature.

The API uses the existing Prisma `Project` and `ProjectCollaborator` models. It does not add a slug field, local user records, invitations, or storage integration.

## Routes

Use Express parameter syntax:

- `GET /api/projects` - list projects accessible to the authenticated user
- `GET /api/projects/:projectId` - read one project accessible to the authenticated user
- `POST /api/projects` - create a project owned by the authenticated user
- `PATCH /api/projects/:projectId` - rename an owned project
- `DELETE /api/projects/:projectId` - permanently delete an owned project

Routes are registered below the existing global rate limiter, `requireAuth`, and JSON body parser in `apps/api/src/app.js`.

## Authentication And Authorization

- Use the verified Clerk `request.userId` as the acting identity and `ownerId`.
- Never accept `ownerId`, user IDs, status, collaborators, or Blob paths from request input.
- `GET /api/projects` returns projects where the user is the owner or a collaborator.
- `GET /api/projects/:projectId` returns a project only when the user is the owner or a collaborator.
- Each listed project includes derived `access`: `owner` or `collaborator`.
- Only the owner can rename or delete a project in this feature.
- A known collaborator attempting an owner-only mutation receives `403`.
- A missing project or a project inaccessible to the requester receives `404` to avoid resource enumeration.
- Archived projects are returned by the list with their status. Archive read-only behavior is deferred until archive operations are specified.

## Request Contracts

### Create

Accepted JSON body:

```json
{
  "name": "Payments Platform"
}
```

- `name` is optional only when omitted; the server defaults it to `Untitled Project`.
- `name` must be a string with leading and trailing whitespace removed.
- An empty, whitespace-only, `null`, or otherwise invalid name returns `400`.
- The name is limited to 80 characters after trimming.
- Unknown fields are rejected with `400`.
- The database generates the project ID using its existing CUID strategy.
- New projects use the database defaults: `DRAFT` status and no canvas path.

### Rename

Accepted JSON body:

```json
{
  "name": "Updated Project Name"
}
```

- `name` is required and must be a non-empty string after trimming.
- The name is limited to 80 characters after trimming.
- Unknown fields are rejected with `400`.
- The project ID, owner, status, collaborators, and canvas path cannot be changed.

### Path Parameter

- `projectId` must be a non-empty valid project identifier.
- Invalid identifiers return `404` without querying or exposing unrelated resources.

## Response Contracts

Project responses expose only:

```json
{
  "id": "cm...",
  "name": "Payments Platform",
  "description": null,
  "status": "DRAFT",
  "access": "owner",
  "createdAt": "2026-08-28T00:00:00.000Z",
  "updatedAt": "2026-08-28T00:00:00.000Z"
}
```

Do not expose `ownerId`, `canvasJsonPath`, or collaborator records in this API response.

- `GET /api/projects` returns `200` with `{ "projects": [] }`.
- `GET /api/projects/:projectId` returns `200` with `{ "project": { ... } }`.
- `POST /api/projects` returns `201` with `{ "project": { ... } }`.
- `PATCH /api/projects/:projectId` returns `200` with `{ "project": { ... } }`.
- `DELETE /api/projects/:projectId` returns `204` with an empty body.

List ordering is newest first by `createdAt`, with `id` as a deterministic tie-breaker. Pagination is deferred until the project list requires it, but the repository must keep the query bounded by a documented server-side maximum.

## Error Contract

Use the existing JSON error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid"
  },
  "requestId": "..."
}
```

Required status handling:

- `401 UNAUTHORIZED` for missing or invalid Clerk session authentication
- `400 VALIDATION_ERROR` for invalid JSON fields or request bodies
- `403 FORBIDDEN` for a known collaborator attempting an owner-only mutation
- `404 NOT_FOUND` for missing or inaccessible projects
- `413 PAYLOAD_TOO_LARGE` for oversized request bodies
- `500 INTERNAL_SERVER_ERROR` for unexpected failures, using the existing redacted error handler

## Delete Semantics

`DELETE` is a hard delete of the project row. `ProjectCollaborator` rows are removed through the existing Prisma cascade relation. Blob cleanup is not implemented in this feature because Blob integrations are not yet available; artifact retention and cleanup must be resolved before artifact-backed deletion is exposed.

## Implementation Boundaries

- Keep routes, thin controllers, services, repositories, and validators under `apps/api/src/modules/projects/`.
- Put reusable request schemas in `packages/shared`.
- Use a centralized project authorization capability rather than duplicating owner checks in controllers.
- Use owner-or-collaborator predicates for list and resource lookup.
- Recheck authorization in the mutation transaction before update or delete.
- Map Prisma/database failures to the existing redacted error contract.

## Check When Done

- Express routes exist for list, create, rename, and delete.
- The detail route returns only projects accessible to the authenticated requester.
- List returns both owned and shared projects with derived access.
- Server-derived ownership and owner-only mutations are enforced.
- Inaccessible IDs do not enumerate project existence.
- Inputs, path parameters, response fields, and error shapes are validated.
- Tests cover owner, collaborator, unrelated user, unauthenticated user, invalid input, archived projects, cross-project IDs, and collaborator cascade deletion.
- `npm run test --workspace=@ghost-ai/api` passes.
