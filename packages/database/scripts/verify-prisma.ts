import { disconnectDatabase, prisma } from "../src/client.js";

try {
  await prisma.project.findFirst({
    select: { id: true },
  });
  console.log("✅ Connected");
} finally {
  await disconnectDatabase();
}
