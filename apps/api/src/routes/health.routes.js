import { Router } from "express";
import { checkDatabaseConnection } from "@ghost-ai/database";

const router = Router();

router.get("/live", (_request, response) => {
  response.json({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  });
});

router.get("/", async (_request, response) => {
  let database = "ok";

  try {
    await checkDatabaseConnection();
  } catch (error) {
    database = "error";
    console.error(
      JSON.stringify({
        event: "database_health_check_failed",
        level: "error",
        errorType: error?.name ?? "UnknownError",
      }),
    );
  }

  const healthy = database === "ok";

  response.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    service: "api",
    database,
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRouter };
