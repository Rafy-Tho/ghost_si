import { Router } from "express";
import { createProjectController } from "./project-controller.js";
import {
  validateCreateProject,
  validateProjectId,
  validateRenameProject,
} from "./project-validators.js";

export function createProjectRouter({ service } = {}) {
  const router = Router();
  const controller = createProjectController(service);

  router.get("/", controller.list);
  router.get("/:projectId", validateProjectId, controller.get);
  router.post("/", validateCreateProject, controller.create);
  router.patch(
    "/:projectId",
    validateProjectId,
    validateRenameProject,
    controller.rename,
  );
  router.delete("/:projectId", validateProjectId, controller.remove);

  return router;
}

export const projectRouter = createProjectRouter();
