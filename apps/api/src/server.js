import { app } from "./app.js";
import { env } from "./config/env.js";
import { disconnectDatabase } from "@ghost-ai/database";

const server = app.listen(env.port, () => {
  console.log(
    JSON.stringify({
      event: "api_started",
      level: "info",
      port: env.port,
      environment: env.nodeEnv,
    }),
  );
});

async function shutdown(signal) {
  console.log(
    JSON.stringify({
      event: "api_shutdown_started",
      level: "info",
      signal,
    }),
  );

  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
