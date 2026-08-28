# Authentication

Set up Clerk for the existing React/Vite frontend and Express API using the existing Clerk application. Clerk is not a replacement for server-side authorization: the frontend route guard improves navigation, while the API independently verifies every protected request.

## Scope

- Browser authentication uses `@clerk/react`.
- Express authentication uses `@clerk/express`.
- Clerk UI themes use `@clerk/ui`.
- No Next.js-specific Clerk packages or middleware are used.
- Clerk remains the source of truth for user identity.
- Prisma stores Clerk user IDs on owned resources; this feature does not add a local user table or Clerk webhooks.

## Environment

Frontend variables belong in `apps/web/.env` and must use Vite's public prefix:

```env
VITE_API_URL=
VITE_CLERK_PUBLISHABLE_KEY=
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/editor
VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/editor
```

API variables belong in `apps/api/.env`:

```env
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

`CLERK_SECRET_KEY` is server-only. It must never be prefixed with `VITE_`, imported by frontend code, or included in the browser bundle. The existing Clerk application's development or production key pair must be used for the matching deployment environment.

## Clerk Appearance

- Use `dark` from `@clerk/ui/themes` as the base theme.
- Layer the Clerk `shadcn` theme for compatibility with the existing shadcn/Tailwind UI.
- Import `@clerk/ui/themes/shadcn.css` from the frontend global stylesheet.
- Map Clerk appearance variables to the existing CSS variables in `globals.css`.
- Do not add hardcoded colors to auth pages or Clerk appearance configuration.

## Frontend

- Wrap the router with `ClerkProvider` in `apps/web/src/main.jsx`.
- Pass the publishable key explicitly and fail fast when it is missing.
- Set `afterSignOutUrl` to `/`.
- Create minimal sign-in and sign-up pages with a two-panel desktop layout and form-only mobile layout.
- Render Clerk `SignIn` and `SignUp` with `routing="path"`.
- Mount auth routes as `/sign-in/*` and `/sign-up/*`; the wildcard is required for Clerk's verification and multi-step flows.
- Use the configured sign-in/sign-up URLs and `/editor` fallback redirect URLs.
- Keep `/` public only as an auth-aware redirect: signed-in users go to `/editor`, signed-out users go to `/sign-in`.
- Protect every other frontend route with a loading-safe `useAuth()` guard that checks `isLoaded` before `isSignedIn`.
- Render Clerk's default `UserButton` in the editor navbar right section. Do not rebuild the profile or logout menu.
- Send authenticated API requests with a Clerk session token from `getToken()` in the `Authorization: Bearer <token>` header.
- Never store Clerk session tokens in local storage or query parameters.

## API

- Register `clerkMiddleware()` before CORS, body parsing, and route registration.
- Configure `authorizedParties` with the exact `CLIENT_ORIGIN` value to prevent cross-origin session-cookie misuse.
- Keep `/api/health` public for liveness and startup checks.
- Protect all other `/api` routes by default with local `requireAuth` middleware using `getAuth(req)`.
- Return JSON `401` responses using the standard error shape:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

- Derive resource ownership from the verified Clerk `userId`; never accept an owner ID from request input.
- Keep authorization and project membership checks after authentication and before mutations.
- Configure CORS for the frontend origin and the `Authorization` request header.
- The API returns JSON `401` responses rather than redirecting browser requests to Clerk.

## Deployment

- Configure the existing Clerk application with local and production frontend origins.
- Configure the frontend sign-in and sign-up paths in the Clerk application settings.
- Set production `CLIENT_ORIGIN` to the exact deployed frontend origin.
- Configure the production SPA host to rewrite `/`, `/editor`, `/sign-in/*`, and `/sign-up/*` to `index.html`.

## Verification

- `npx clerk@latest doctor` reports a valid frontend setup after the existing Clerk application keys are configured.
- Signed-out `/` redirects to `/sign-in`.
- Signed-in `/` redirects to `/editor`.
- Direct access to `/editor` redirects signed-out users to `/sign-in`.
- Sign-in and sign-up verification steps work through their wildcard routes.
- The editor navbar displays Clerk's default `UserButton`.
- Signing out returns the user to `/`.
- `/api/health` remains accessible without a token.
- Protected API requests without authentication receive the documented `401` response.
- Protected API requests with a valid Clerk session token reach their route handler.
- Frontend production build and API authentication tests pass.
