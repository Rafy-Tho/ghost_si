# Set Up Collaborative React Flow Canvas

Replace the canvas placeholder with a Liveblocks-backed React Flow canvas.

## Implementation

1. Create a client-side canvas editor that joins the Liveblocks room for the canonical `projectId`.

   It should include:
   - `LiveblocksProvider` using `/api/liveblocks-auth`
   - `RoomProvider` using the canonical `projectId` as the room key
   - initial presence with `cursor: null`
   - `ClientSideSuspense` with a simple loading state
   - an error fallback for Liveblocks connection issues

2. Wire React Flow to Liveblocks state.
   - use the installed Liveblocks React Flow integration and document its exact package/module import
   - enable suspense
   - initialize an empty room with empty nodes and edges without overwriting existing room state
   - pass the synced nodes, edges, and change handlers into `ReactFlow`

3. Add shared canvas contracts in `packages/shared` using plain JavaScript, following the repository's shared-contract conventions.

   Node data should support:
   - `label`
   - `color`
   - `shape`

   Also define the custom node and edge type identifiers:
   - `canvasNode`
   - `canvasEdge`

   The implementation must add the React Flow dependency to `apps/web` and use the package/version compatible with the selected Liveblocks integration. Do not introduce TypeScript application source.

4. Render the basic collaborative canvas.

   Include:
   - loose connection behavior
   - `fitView`
   - `MiniMap`
   - dot-pattern background using the existing design tokens
   - a measurable container that fills the available workspace area

5. Integrate the canvas into the existing React workspace page.
   - Pass the canonical `projectId` into the canvas editor.
   - Keep the implementation fully client-side.
   - Do not introduce Next.js server components, SSR, or Next.js-specific APIs.
   - Preserve the existing project loading, access-denied, authentication-error, retry, sidebar, and AI-sidebar behavior.
   - Keep the canvas usable when desktop sidebars resize the workspace and when mobile sidebars become drawers.

## Scope Limits

- Don’t add controls yet.
- Don’t add custom node or edge rendering yet.
- Don’t add persistence logic.
- Don’t add AI behavior.
- Don’t add authentication logic beyond the existing Liveblocks auth endpoint.
- Don’t add persistence logic, Blob writes, or database storage for the active graph.
- Don’t add custom Ghost AI node shapes, colors, handles, edge styles, or custom node/edge rendering yet; use React Flow defaults.
- Keep this focused on the collaborative canvas foundation.
- Keep the implementation **100% React/Vite**; do not add Next.js-specific patterns or APIs.

## Check When Done

- React canvas editor successfully sets up the Liveblocks room.
- `LiveblocksProvider` and `RoomProvider` are correctly configured.
- The browser supplies only the canonical `projectId` to the existing Liveblocks auth flow and never selects an arbitrary room ID.
- React Flow uses Liveblocks-synced nodes and edges.
- Shared canvas contracts exist in `packages/shared` and remain plain JavaScript.
- The React Flow dependency and Liveblocks React Flow integration are declared and imported from the documented compatible packages.
- Empty room initialization does not overwrite existing synchronized nodes or edges.
- The canvas renders with `MiniMap`, `fitView`, loose connections, and a dot-pattern background.
- The canvas fills its available container and remains functional across sidebar transitions and mobile layouts.
- Loading and connection errors are exposed through accessible status/error content without leaking provider details.
- Existing project authorization remains authoritative: missing or inaccessible projects cannot obtain a room session or render the collaborative canvas.
- Liveblocks secrets, tokens, and client-supplied identity values are never exposed or trusted in the browser.
- The existing API collaboration authorization tests continue to cover owner, collaborator, unrelated-project, invalid-authentication, and forged-room cases.
- `npm test --workspace=@ghost-ai/api`, `npm run build:web`, and `git diff --check` pass.
- No Next.js-specific code is introduced.
- `context/06_progress-tracker.md` records the actual verification results.
