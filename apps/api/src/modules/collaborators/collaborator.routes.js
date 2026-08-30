import { Router } from "express";
import { createCollaboratorController } from "./collaborator-controller.js";
import {
  validateCollaboratorEmail,
  validateCollaboratorParams,
  validateCollaboratorProjectParams,
} from "./collaborator-validators.js";

export function createCollaboratorRouter({ service } = {}) {
  const router = Router({ mergeParams: true });
  const controller = createCollaboratorController(service);

  router.get("/", validateCollaboratorProjectParams, controller.list);
  router.post(
    "/",
    validateCollaboratorProjectParams,
    validateCollaboratorEmail,
    controller.add,
  );
  router.delete(
    "/:userId",
    validateCollaboratorParams,
    controller.remove,
  );

  return router;
}

export const collaboratorRouter = createCollaboratorRouter();
