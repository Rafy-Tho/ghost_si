import { createProjectService } from "./project-service.js";

export function createProjectController(service = createProjectService()) {
  return {
    list: async (request, response) => {
      const projects = await service.listProjects(request.userId);
      response.json({ projects });
    },

    create: async (request, response) => {
      const project = await service.createProject(
        request.userId,
        request.validatedBody,
      );
      response.status(201).json({ project });
    },

    rename: async (request, response) => {
      const project = await service.renameProject(
        request.userId,
        request.validatedParams.projectId,
        request.validatedBody,
      );
      response.json({ project });
    },

    remove: async (request, response) => {
      await service.deleteProject(
        request.userId,
        request.validatedParams.projectId,
      );
      response.status(204).end();
    },
  };
}
