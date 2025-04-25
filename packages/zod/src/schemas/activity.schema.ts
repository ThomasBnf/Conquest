import { z } from "zod";
import { SOURCE } from "../enum/source.enum";
import { ActivityTypeSchema } from "./activity-type.schema";

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  title: z.string(),
  message: z.string(),
  replyTo: z.string(),
  reactTo: z.string(),
  inviteTo: z.string(),
  source: SOURCE,
  activityTypeId: z.string().uuid(),
  channelId: z.string().uuid().nullable(),
  eventId: z.string().uuid().nullable(),
  memberId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ActivityWithTypeSchema = ActivitySchema.extend({
  activityType: ActivityTypeSchema,
});

export const ActivityHeatmapSchema = z.object({
  date: z.string(),
  count: z.string(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithType = z.infer<typeof ActivityWithTypeSchema>;
export type ActivityHeatmap = z.infer<typeof ActivityHeatmapSchema>;
