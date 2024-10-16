import { z } from "zod";
import { ContactSchema } from "./contact.schema";

export const TYPE = z.enum(["MESSAGE", "REACTION", "REPLY"]);

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
  attachments: z.array(AttachmentsSchema).default([]),
  files: z.array(FilesSchema).default([]),
  reference: z.string().optional(),
  ts: z.string().optional(),
});

export const ActivityDetailsSchema = z.discriminatedUnion("source", [
  ActivityAPISchema,
  ActivitySlackSchema,
]);

export const ActivitySchema = z.object({
  id: z.string().cuid(),
  details: ActivityDetailsSchema,
  channel_id: z.string().cuid().nullable(),
  contact_id: z.string().cuid(),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const ActivityWithContactSchema = ActivitySchema.extend({
  contact: ContactSchema,
});

export const ContactWithActivitiesSchema = ContactSchema.extend({
  activities: z.array(ActivitySchema).default([]),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithContact = z.infer<typeof ActivityWithContactSchema>;
export type ContactWithActivities = z.infer<typeof ContactWithActivitiesSchema>;

export type ActivityAPI = z.infer<typeof ActivityAPISchema>;
export type ActivitySlack = z.infer<typeof ActivitySlackSchema>;
export type ActivityDetails = z.infer<typeof ActivityDetailsSchema>;

export type Attachments = z.infer<typeof AttachmentsSchema>;
export type Files = z.infer<typeof FilesSchema>;
export type Type = z.infer<typeof TYPE>;
