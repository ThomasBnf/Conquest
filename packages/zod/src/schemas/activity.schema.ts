import { z } from "zod";
import { SOURCE } from "../enum/source.enum";
import { ActivityTypeSchema } from "./activity-type.schema";

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  externalId: z.string().nullable(),
  activityTypeKey: z.string(),
  title: z.string().nullable(),
  message: z.string(),
  replyTo: z.string().nullable(),
  reactTo: z.string().nullable(),
  inviteTo: z.string().nullable(),
  source: SOURCE,
  channelId: z.string().nullable(),
  eventId: z.string().nullable(),
  memberId: z.string(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ActivityWithTypeSchema = ActivitySchema.extend({
  activityType: ActivityTypeSchema,
});

export const ActivityHeatmapSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithType = z.infer<typeof ActivityWithTypeSchema>;
export type ActivityHeatmap = z.infer<typeof ActivityHeatmapSchema>;
