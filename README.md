# Ghost AI

Ghost AI is a React/Vite frontend with a Node.js/Express API and a Prisma/PostgreSQL data layer.

## Startup Foundation

The current foundation includes:

- React Router browser boot
- Vite development proxy from `/api` to the Express API
- Express liveness and database health endpoints
- Prisma 7.10.0 Client with `Project` and `ProjectCollaborator` models
- PostgreSQL migrations, deterministic seed data, and a connection verification script

Authentication, collaboration, AI tasks, artifact storage, and product features are not implemented yet.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Clerk values in `apps/api/.env`. `DATABASE_URL` is loaded from the ignored workspace-root `.env` file for the shared database package and API. The linked Prisma Postgres database supplies this value automatically during setup.

3. Validate and generate Prisma Client:

   ```bash
   npm run db:validate
   npm run db:generate
   ```

4. Apply the initial migration:

   ```bash
   npm run db:migrate
   ```

5. Seed deterministic starter rows and verify one database read:

   ```bash
   npm run db:seed
   npm run db:verify
   ```

6. Start the API:

   ```bash
   npm run dev:api
   ```

7. In another terminal, start the frontend:

   ```bash
   npm run dev:web
   ```

Open `http://localhost:5173` to view the startup check. The API health endpoints are available at `/api/health/live` and `/api/health`.

For a separate frontend deployment, set `VITE_API_URL` in `apps/web/.env` to the deployed API URL and configure the API's `CLIENT_ORIGIN` accordingly.
