import { z } from "zod";
import { MemberSchema } from "./member.schema";

export const TYPE = z.enum(["POST", "REACTION", "REPLY", "INVITE"]);

export const AttachmentsSchema = z.object({
  title: z.string(),
  url: z.string(),
});

export const FilesSchema = z.object({
  title: z.string(),
  url: z.string(),
});

export const ActivityAPISchema = z.object({
  source: z.literal("API"),
  type: z.string(),
  message: z.string(),
});

export const ActivitySlackSchema = z.object({
  source: z.literal("SLACK"),
  type: TYPE,
  message: z.string(),
  files: z.array(FilesSchema).default([]),
  reply_to: z.string().nullable().optional(),
  react_to: z.string().nullable().optional(),
  invite_by: z.string().nullable().optional(),
});

export const ActivityDetailsSchema = z.discriminatedUnion("source", [
  ActivityAPISchema,
  ActivitySlackSchema,
]);

export const ActivitySchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  details: ActivityDetailsSchema,
  channel_id: z.string().cuid().nullable(),
  member_id: z.string().cuid(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const ActivityWithMemberSchema = ActivitySchema.extend({
  member: MemberSchema,
});

export const MemberWithActivitiesSchema = MemberSchema.extend({
  activities: z.array(ActivitySchema).default([]),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithMember = z.infer<typeof ActivityWithMemberSchema>;
export type MemberWithActivities = z.infer<typeof MemberWithActivitiesSchema>;

export type ActivityAPI = z.infer<typeof ActivityAPISchema>;
export type ActivitySlack = z.infer<typeof ActivitySlackSchema>;
export type ActivityDetails = z.infer<typeof ActivityDetailsSchema>;

export type Attachments = z.infer<typeof AttachmentsSchema>;
export type Files = z.infer<typeof FilesSchema>;
export type Type = z.infer<typeof TYPE>;
