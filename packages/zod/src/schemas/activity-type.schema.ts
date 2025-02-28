import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const ActivityTypeRuleSchema = z.object({
  id: z.string().uuid(),
  channel_id: z.string().uuid(),
  points: z.coerce.number().int().min(0),
});

export const ActivityTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  source: SOURCE,
  key: z.string(),
  points: z.coerce.number().int().min(0),
  conditions: z.object({
    rules: z.array(ActivityTypeRuleSchema),
  }),
  deletable: z.boolean(),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type ActivityTypeRule = z.infer<typeof ActivityTypeRuleSchema>;
