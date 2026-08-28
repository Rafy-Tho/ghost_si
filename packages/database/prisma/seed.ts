import { disconnectDatabase, prisma } from "../src/client.js";

const projects = [
  {
    id: "seed-ghost-ai-project",
    ownerId: "seed-owner-001",
    name: "Ghost AI Starter",
    description: "Seed project for local Prisma verification.",
  },
  {
    id: "seed-collaboration-project",
    ownerId: "seed-owner-002",
    name: "Collaboration Example",
    description: "Seed project demonstrating collaborator access.",
  },
];

const collaborators = [
  { projectId: projects[0].id, userId: "seed-collaborator-001" },
  { projectId: projects[1].id, userId: "seed-collaborator-002" },
];

async function main() {
  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: project,
      create: project,
    });
  }

  for (const collaborator of collaborators) {
    await prisma.projectCollaborator.upsert({
      where: { projectId_userId: collaborator },
      update: {},
      create: collaborator,
    });
  }

  console.log(`Seeded ${projects.length} projects and ${collaborators.length} collaborators.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
