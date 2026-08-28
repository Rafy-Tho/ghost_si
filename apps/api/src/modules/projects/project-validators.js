import {
  createProjectSchema,
  projectIdParamsSchema,
  renameProjectSchema,
} from "@ghost-ai/shared/validation/project";
import { projectNotFound, projectValidationError } from "./project-errors.js";

function parse(schema, value) {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw projectValidationError();
  }

  return result.data;
}

export function validateCreateProject(request, _response, next) {
  request.validatedBody = parse(createProjectSchema, request.body);
  next();
}

export function validateRenameProject(request, _response, next) {
  request.validatedBody = parse(renameProjectSchema, request.body);
  next();
}

export function validateProjectId(request, _response, next) {
  const result = projectIdParamsSchema.safeParse(request.params);

  if (!result.success) {
    throw projectNotFound();
  }

  request.validatedParams = result.data;
  next();
}
