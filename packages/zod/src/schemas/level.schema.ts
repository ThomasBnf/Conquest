import { z } from "zod";

export const LevelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  number: z.number(),
  from: z.number(),
  to: z.number().nullable(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const LEVEL = z.object({
  number: z.number(),
  name: z.string(),
  from: z.number(),
  to: z.number().nullable(),
});

export type Level = z.infer<typeof LevelSchema>;
export type LEVEL = z.infer<typeof LEVEL>;
