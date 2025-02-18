import type { activity as ActivityPrisma } from "@prisma/client";
import { z } from "zod";
import { SOURCE } from "../enum/source.enum";
import { ActivityTypeSchema } from "./activity-type.schema";

export const ActivitySchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  title: z.string().nullable(),
  message: z.string(),
  reply_to: z.string().nullable(),
  react_to: z.string().nullable(),
  invite_to: z.string().nullable(),
  source: SOURCE,
  activity_type_id: z.string().cuid(),
  channel_id: z.string().cuid().nullable(),
  event_id: z.string().cuid().nullable(),
  member_id: z.string().cuid(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<ActivityPrisma>;

export const ActivityWithTypeSchema = ActivitySchema.extend({
  activity_type: ActivityTypeSchema,
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithType = z.infer<typeof ActivityWithTypeSchema>;
