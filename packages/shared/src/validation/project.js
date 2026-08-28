import { z } from "zod";

export const PROJECT_NAME_MAX_LENGTH = 80;

const projectName = z
  .string()
  .trim()
  .min(1)
  .max(PROJECT_NAME_MAX_LENGTH);

export const createProjectSchema = z.preprocess(
  (value) => (value === undefined ? {} : value),
  z
    .object({
      name: projectName.optional(),
    })
    .strict(),
);

export const renameProjectSchema = z
  .object({
    name: projectName,
  })
  .strict();

export const projectIdParamsSchema = z
  .object({
    projectId: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[A-Za-z0-9_-]+$/),
  })
  .strict();
