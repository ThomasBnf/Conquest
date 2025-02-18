import type { activity_type } from "@prisma/client";
import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const ActivityTypeConditionSchema = z.object({
  id: z.string().cuid(),
  channel_id: z.string().cuid(),
  points: z.coerce.number().int().min(0),
});

export const ActivityTypeSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  source: SOURCE,
  key: z.string(),
  points: z.coerce.number().int().min(0),
  conditions: z.array(ActivityTypeConditionSchema),
  deletable: z.boolean(),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<activity_type>;

export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type ActivityTypeCondition = z.infer<typeof ActivityTypeConditionSchema>;
