import { z } from "zod";
import { ActivityTypeSchema } from "./activity-type.schema";
import { CompanySchema } from "./company.schema";
import { MemberSchema } from "./member.schema";

export const ActivitySchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  title: z.string().nullable(),
  message: z.string(),
  thread_id: z.string().nullable(),
  reply_to: z.string().nullable(),
  react_to: z.string().nullable(),
  invite_to: z.string().nullable(),
  activity_type_id: z.string().cuid(),
  channel_id: z.string().cuid().nullable(),
  event_id: z.string().cuid().nullable(),
  member_id: z.string().cuid(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const ActivityWithTypeSchema = ActivitySchema.extend({
  activity_type: ActivityTypeSchema,
});

export const ActivityWithMemberSchema = ActivitySchema.extend({
  member: MemberSchema,
});

export const ActivityWithTypeAndMemberSchema = ActivityWithTypeSchema.extend({
  member: MemberSchema,
});

export const MemberWithActivitiesSchema = MemberSchema.extend({
  activities: z.array(ActivityWithTypeSchema).default([]),
  company: CompanySchema.nullable(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithType = z.infer<typeof ActivityWithTypeSchema>;
export type ActivityWithMember = z.infer<typeof ActivityWithMemberSchema>;
export type ActivityWithTypeAndMember = z.infer<
  typeof ActivityWithTypeAndMemberSchema
>;
export type MemberWithActivities = z.infer<typeof MemberWithActivitiesSchema>;
