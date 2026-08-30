import { Router } from "express";
import { createCollaborationController } from "./collaboration-controller.js";
import { validateCollaborationRequest } from "./collaboration-validators.js";

export function createCollaborationRouter({ service } = {}) {
  const router = Router();
  const controller = createCollaborationController(service);

  router.post("/liveblocks-auth", validateCollaborationRequest, controller.authorize);

  return router;
}

export const collaborationRouter = createCollaborationRouter();
