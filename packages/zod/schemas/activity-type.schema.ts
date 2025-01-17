import type { activities_types } from "@prisma/client";
import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const ActivityTypeSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  source: SOURCE,
  key: z.string(),
  weight: z.number().int().min(0).max(12),
  channels: z.array(z.string()),
  deletable: z.boolean(),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<activities_types>;

export type ActivityType = z.infer<typeof ActivityTypeSchema>;
