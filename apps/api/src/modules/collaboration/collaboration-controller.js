import { createCollaborationService } from "./collaboration-service.js";

export function createCollaborationController(
  service = createCollaborationService(),
) {
  return {
    authorize: async (request, response) => {
      const authorization = await service.authorize(
        request.userId,
        request.validatedBody.projectId,
      );
      response
        .status(authorization.status)
        .type("application/json")
        .send(authorization.body);
    },
  };
}
