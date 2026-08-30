import {
  collaboratorEmailSchema,
  collaboratorParamsSchema,
  collaboratorProjectParamsSchema,
} from "@ghost-ai/shared/validation/collaborator";
import {
  collaboratorNotFound,
  collaboratorValidationError,
} from "./collaborator-errors.js";

function parse(schema, value, errorFactory = collaboratorValidationError) {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw errorFactory();
  }

  return result.data;
}

export function validateCollaboratorProjectParams(request, _response, next) {
  request.validatedParams = parse(
    collaboratorProjectParamsSchema,
    request.params,
    collaboratorNotFound,
  );
  next();
}

export function validateCollaboratorParams(request, _response, next) {
  request.validatedParams = parse(
    collaboratorParamsSchema,
    request.params,
    collaboratorNotFound,
  );
  next();
}

export function validateCollaboratorEmail(request, _response, next) {
  request.validatedBody = parse(collaboratorEmailSchema, request.body);
  next();
}
