# Liveblocks Collaboration Setup

## Goal

Set up the Liveblocks realtime collaboration infrastructure for project workspaces. This feature establishes Liveblocks configuration, room authorization, session metadata, and the cached browser client. Do not add React Flow nodes, edges, canvas editing, snapshots, AI generation, or Blob persistence.

The database-generated project CUID remains the canonical `projectId`. The browser must not use or construct an independent room identifier.

## Configuration

Configure the Liveblocks project configuration at the repository root as `liveblocks.config.ts` if required by the installed Liveblocks tooling. This is a tooling configuration exception; application source remains plain JavaScript.

Define the shared Liveblocks contracts:

### Presence

- `cursor`: `{ x: number, y: number } | null`
- `isThinking`: boolean

New sessions use `cursor: null` and `isThinking: false` unless the client explicitly updates presence. Presence is ephemeral and must not be persisted in PostgreSQL or Vercel Blob.

### UserMeta

- `userId`: verified Clerk user ID
- `displayName`: safe display name resolved by the server
- `avatarUrl`: avatar URL or `null`
- `cursorColor`: color selected by the server from the fixed palette

The client must not provide or override the user ID, display name, avatar URL, or cursor color used for the authenticated session.

## Dependencies And Environment

- Add the required Liveblocks packages to the workspace package that uses them. The current repository does not yet contain these dependencies despite the previous claim that they were installed.
- Browser Liveblocks dependencies belong to `apps/web`.
- Server Liveblocks dependencies belong to `apps/api`.
- Add a server-only `LIVEBLOCKS_SECRET_KEY` environment variable to the API environment example and validation.
- Never expose `LIVEBLOCKS_SECRET_KEY` through Vite or any browser bundle.

## Server Integration

Create the cached server-side Liveblocks client under:

- `apps/api/src/integrations/liveblocks/`

The client must be initialized from the validated server secret and reused rather than recreated for every request.

Add a helper that deterministically maps a verified Clerk user ID to a consistent cursor color from a fixed palette. The mapping must be stable across sessions and must not depend on mutable profile data.

## Auth Route

Create `POST /api/liveblocks-auth` and register it through the existing API application boundary. Feature code belongs under:

- `apps/api/src/modules/collaboration/`

The request body is:

```json
{
  "projectId": "project_cuid"
}
```

Reject malformed project IDs and unknown request fields using the existing validation and error conventions. The client must not send a `roomId`.

The route must:

1. Require the existing Clerk bearer-token authentication middleware.
2. Derive the acting user ID from the verified Clerk session, never from the request body.
3. Verify project membership using the existing centralized project access helper.
4. Return the existing non-enumerating `404` response for a missing or inaccessible project.
5. Derive the Liveblocks room ID server-side from the authorized project ID. The project ID may remain the room ID, but the client must never choose or map arbitrary room identities.
6. Ensure the Liveblocks room exists, creating it only when needed. Room creation must be idempotent when concurrent requests encounter an already-existing room.
7. Issue the smallest required room permission for the current collaboration scope: `room:write, comments:write` (the current Liveblocks syntax; write access also permits reading the room).
8. Bind the Liveblocks session identity to the verified Clerk user ID.
9. Attach safe user metadata containing the display name, avatar URL, and deterministic cursor color.

Return safe JSON errors using the existing API error shape. Do not expose Liveblocks provider responses, secrets, tokens, or internal errors in responses or logs.

The route must remain protected by the existing global and authenticated rate limits. Add a collaboration-specific limiter if required by the security plan.

## Browser Client

Create the cached browser Liveblocks client under one of these application locations, following the existing feature organization:

- `apps/web/src/features/collaboration/`
- `apps/web/src/lib/`

Configure the client to obtain authorization from `/api/liveblocks-auth`. The authorization request must:

- include the current canonical `projectId`
- include the Clerk session token as a bearer token
- never include a client-selected `roomId`
- preserve the API's normalized authentication and error handling behavior

The client must be cached so repeated renders do not create multiple Liveblocks clients. Do not join a room or render collaboration UI as part of this setup unless required to verify the client configuration.

## Implementation Boundaries

- `apps/api/src/integrations/liveblocks/` owns the Liveblocks server adapter and provider calls.
- `apps/api/src/modules/collaboration/` owns the auth route, request validation, and project access orchestration.
- `apps/web/src/features/collaboration/` or `apps/web/src/lib/` owns the browser client.
- `packages/shared/` owns any reusable presence, user metadata, or validation contracts needed by both applications.
- Do not add Prisma models for active room state, presence, cursors, or the current graph.
- Do not modify generated shadcn/ui primitives.

## Security Requirements

- Project membership is checked before room creation or token issuance.
- Room IDs are derived only from server-authorized project IDs.
- Tokens use the minimum required room permissions and the provider's supported expiration policy.
- User identity is derived only from verified Clerk authentication.
- Liveblocks secrets remain server-only.
- Request bodies, prompts, graphs, tokens, credentials, provider responses, and generated content must not be logged.
- Define or preserve maximum room payload and update sizes according to the security plan before enabling graph mutations.

## Checks When Done

- The Liveblocks configuration defines `Presence` and `UserMeta` with the documented fields.
- Required Liveblocks dependencies are declared in the correct workspace packages.
- `LIVEBLOCKS_SECRET_KEY` is documented and validated only in the API environment.
- The server Liveblocks client is cached and uses the server secret.
- The cursor color helper is deterministic for the same Clerk user ID.
- An authenticated project owner can obtain a room token.
- An authenticated collaborator can obtain a room token.
- An unrelated or missing project returns the non-enumerating `404` response.
- Missing or invalid Clerk authentication returns `401`.
- Client-supplied room IDs cannot select an arbitrary room.
- Room creation is safe when the room already exists.
- Session identity, user metadata, and room permissions are correct.
- Provider failures return safe normalized API errors.
- `npm test --workspace=@ghost-ai/api` passes.
- `npm run build:web` passes.
- `git diff --check` passes.
- Update `context/06_progress-tracker.md` with the actual verification results after implementation.

## Out Of Scope

- React Flow nodes, edges, handles, shapes, or canvas editing
- Live cursors or presence UI beyond the client/session foundation
- Canvas snapshots or Vercel Blob persistence
- AI chat, architecture generation, or Trigger.dev task runs
- Markdown specification generation
- Starter template import
- Public rooms, anonymous access, or invitation links
- Immediate room-session revocation beyond the existing Liveblocks token policy
