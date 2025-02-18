import type { level as LevelPrisma } from "@prisma/client";
import { z } from "zod";

export const LevelSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  number: z.number(),
  from: z.number(),
  to: z.number().nullable(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<LevelPrisma>;

export type Level = z.infer<typeof LevelSchema>;
