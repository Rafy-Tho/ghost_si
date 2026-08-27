# Ghost AI

Ghost AI is a React/Vite frontend with a Node.js/Express API and a Prisma/PostgreSQL data layer.

## Startup Foundation

The current foundation includes:

- React Router browser boot
- Vite development proxy from `/api` to the Express API
- Express liveness and database health endpoints
- Prisma Client and the initial `Project` database model
- An initial PostgreSQL migration

Authentication, collaboration, AI tasks, artifact storage, and product features are not implemented yet.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `apps/api/.env.example` to `apps/api/.env` and `packages/database/.env.example` to `packages/database/.env`. Set the PostgreSQL credentials in both files.

3. Validate and generate Prisma Client:

   ```bash
   npm run db:validate
   npm run db:generate
   ```

4. Apply the initial migration:

   ```bash
   npm run db:migrate
   ```

5. Start the API:

   ```bash
   npm run dev:api
   ```

6. In another terminal, start the frontend:

   ```bash
   npm run dev:web
   ```

Open `http://localhost:5173` to view the startup check. The API health endpoints are available at `/api/health/live` and `/api/health`.

For a separate frontend deployment, set `VITE_API_URL` in `apps/web/.env` to the deployed API URL and configure the API's `CLIENT_ORIGIN` accordingly.
