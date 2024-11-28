import type { activities as ActivityPrisma } from "@prisma/client";
import { z } from "zod";
import { ActivityTypeSchema } from "./activity-type.schema";
import { MemberSchema } from "./member.schema";

export const ActivitySchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  message: z.string(),
  reply_to: z.string().nullable(),
  react_to: z.string().nullable(),
  invite_by: z.string().nullable(),

  activity_type_id: z.string().cuid(),
  channel_id: z.string().cuid().nullable(),
  member_id: z.string().cuid(),
  workspace_id: z.string().cuid(),

  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<ActivityPrisma>;

export const ActivityWithTypeSchema = ActivitySchema.extend({
  activity_type: ActivityTypeSchema,
});

export const ActivityWithMemberSchema = ActivityWithTypeSchema.extend({
  member: MemberSchema,
});

export const MemberWithActivitiesSchema = MemberSchema.extend({
  level: z.number().default(0),
  love: z.number().default(0),
  activities: z.array(ActivityWithTypeSchema).default([]),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithType = z.infer<typeof ActivityWithTypeSchema>;
export type ActivityWithMember = z.infer<typeof ActivityWithMemberSchema>;
export type MemberWithActivities = z.infer<typeof MemberWithActivitiesSchema>;
