# Prisma Schema And Data Layer

## Goal

Use Prisma 7.10.0 to provide the relational data layer in `packages/database`. Keep Prisma access inside the shared database package so the API and worker can consume one client boundary.

The linked Prisma Postgres connection is loaded from the ignored workspace-root `.env` file. Prisma configuration and runtime code must never expose the connection string or credentials.

## Models

Define the models in `packages/database/prisma/schema.prisma`. This project uses one Prisma schema file; do not add a separate `prisma/models` directory unless Prisma schema-folder support is explicitly introduced.

Add `Project`:

- `ownerId` mapped to a Clerk user ID; Clerk remains the identity source and is not a database relation
- name
- optional description
- status enum: `DRAFT`, `ARCHIVED`
- optional `canvasJsonPath` for the Vercel Blob canvas snapshot URL
- timestamps
- indexes on owner ID and creation date

Add `ProjectCollaborator`:

- project relation with cascade delete
- collaborator `userId` mapped to a Clerk user ID; an email entered in the share UI is resolved by the API and is not stored as the membership identity
- creation timestamp
- composite primary key on project ID and user ID
- indexes on user ID and project/date

The relation field on `Project` and the foreign-key field on `ProjectCollaborator` are required by Prisma. Do not add invitation, role, email-only, or local user fields.

## Prisma Client

The cached singleton lives at `packages/database/src/client.js` and is exported through `@ghost-ai/database`.

Use the direct `@prisma/adapter-pg` driver adapter for the Prisma Postgres connection. Do not add an Accelerate branch unless an explicit Accelerate dependency and deployment requirement is introduced. Cache the Prisma client, adapter, and pool on `globalThis` in development for hot reloads, and close both the client and pool during shutdown.

## Migration

Keep the existing initial PostgreSQL migration. Apply the schema additions as a new migration with `npx prisma migrate dev --name init`, then generate the client with `npx prisma generate`.

Prisma configuration belongs at `packages/database/prisma.config.ts` and must configure:

- schema path `prisma/schema.prisma`
- migrations path `prisma/migrations`
- seed command `tsx prisma/seed.ts`
- `DATABASE_URL` from the environment

Do not reset a database to resolve migration drift without explicit approval.

## Seed And Verification

Create `packages/database/prisma/seed.ts` with deterministic starter projects and collaborators. Use upserts so reseeding does not duplicate rows.

Create `packages/database/scripts/verify-prisma.ts`. It must perform one read through the generated client and print `✅ Connected` on success.

## Dependencies

Install in `@ghost-ai/database`:

- `prisma@7.10.0` (development)
- `@types/node` (development)
- `@types/pg` (development)
- `tsx` (development)
- `@prisma/client@7.10.0`
- `@prisma/adapter-pg@7.10.0`
- `pg`
- `dotenv`

## Check When Done

- schema has both models with the approved Clerk-ID relation and indexes
- `packages/database/src/client.js` exports one cached Prisma instance
- migration, generation, seed, and verification run successfully
- API database health remains available through the shared database package
