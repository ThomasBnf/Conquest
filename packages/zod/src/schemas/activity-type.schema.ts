import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const ActivityTypeRuleSchema = z.object({
  id: z.string().uuid(),
  channelId: z.string().min(1, { message: "Channel is required" }),
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
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type ActivityTypeRule = z.infer<typeof ActivityTypeRuleSchema>;
