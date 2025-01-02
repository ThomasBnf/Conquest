import type { activities_types } from "@prisma/client";
import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const KEYSchema = z.union([
  z.literal("slack:post"),
  z.literal("slack:reply"),
  z.literal("slack:invitation"),
  z.literal("slack:reaction"),
  z.string(),
]);

export const ActivityTypeSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  source: SOURCE,
  key: KEYSchema,
  weight: z.number().int().min(0).max(12),
  deletable: z.boolean(),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<activities_types>;

export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type KEY = z.infer<typeof KEYSchema>;
