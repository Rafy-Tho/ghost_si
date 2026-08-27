import { app } from "./app.js";
import { env } from "./config/env.js";
import { disconnectDatabase } from "@ghost-ai/database";

const server = app.listen(env.port, () => {
  console.log(`Ghost AI API listening on http://localhost:${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
