import { z } from "zod";

export const COLLABORATOR_EMAIL_MAX_LENGTH = 254;
export const CLERK_USER_ID_MAX_LENGTH = 100;

export const collaboratorEmailSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(COLLABORATOR_EMAIL_MAX_LENGTH)
      .email(),
  })
  .strict();

const projectId = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9_-]+$/);

const clerkUserId = z
  .string()
  .min(1)
  .max(CLERK_USER_ID_MAX_LENGTH)
  .regex(/^[A-Za-z0-9_-]+$/);

export const collaboratorProjectParamsSchema = z
  .object({ projectId })
  .strict();

export const collaboratorParamsSchema = z
  .object({ projectId, userId: clerkUserId })
  .strict();
