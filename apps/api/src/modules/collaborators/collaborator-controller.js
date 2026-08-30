import { createCollaboratorService } from "./collaborator-service.js";

export function createCollaboratorController(service = createCollaboratorService()) {
  return {
    list: async (request, response) => {
      const collaborators = await service.listCollaborators(
        request.userId,
        request.validatedParams.projectId,
      );
      response.json(collaborators);
    },

    add: async (request, response) => {
      const collaborator = await service.addCollaborator(
        request.userId,
        request.validatedParams.projectId,
        request.validatedBody.email,
      );
      response.status(201).json({ collaborator });
    },

    remove: async (request, response) => {
      await service.removeCollaborator(
        request.userId,
        request.validatedParams.projectId,
        request.validatedParams.userId,
      );
      response.status(204).end();
    },
  };
}
