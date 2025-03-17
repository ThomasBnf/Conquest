import { z } from "zod";
import { SOURCE } from "../enum/source.enum";
import { ActivityTypeSchema } from "./activity-type.schema";

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  external_id: z.string(),
  title: z.string(),
  message: z.string(),
  reply_to: z.string(),
  react_to: z.string(),
  invite_to: z.string(),
  source: SOURCE,
  activity_type_id: z.string(),
  channel_id: z.string(),
  event_id: z.string().nullable(),
  member_id: z.string(),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const ActivityWithTypeSchema = ActivitySchema.extend({
  activity_type: ActivityTypeSchema,
});

export const ActivityHeatmapSchema = z.object({
  date: z.string(),
  count: z.string(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithType = z.infer<typeof ActivityWithTypeSchema>;
export type ActivityHeatmap = z.infer<typeof ActivityHeatmapSchema>;
