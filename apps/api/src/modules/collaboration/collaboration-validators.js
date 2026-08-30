import { z } from "zod";
import { collaborationValidationError } from "./collaboration-errors.js";

const requestSchema = z.object({
  projectId: z.string().trim().min(1).max(100),
}).strict();

export function validateCollaborationRequest(request, _response, next) {
  const result = requestSchema.safeParse(request.body);

  if (!result.success) {
    throw collaborationValidationError();
  }

  request.validatedBody = result.data;
  next();
}
