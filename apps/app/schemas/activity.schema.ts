import { z } from "zod";
import { ContactSchema } from "./contact.schema";

export const ActivityAttachmentsSchema = z
  .array(
    z.object({
      title: z.string(),
      url: z.string(),
    }),
  )
  .default([]);

export const ActivityFilesSchema = z
  .array(
    z.object({
      title: z.string(),
      url: z.string(),
    }),
  )
  .default([]);

const ActivityAPISchema = z.object({
  source: z.literal("API"),
  type: z.string(),
  message: z.string(),
});

const ActivitySlackSchema = z.object({
  source: z.literal("SLACK"),
  type: z.enum(["MESSAGE", "REACTION"]),
  message: z.string(),
  attachments: ActivityAttachmentsSchema,
  files: ActivityFilesSchema,
  reference: z.string().cuid().optional(),
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
  activities: ActivitySchema.array(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityWithContact = z.infer<typeof ActivityWithContactSchema>;
export type ContactWithActivities = z.infer<typeof ContactWithActivitiesSchema>;

export type ActivityAPI = z.infer<typeof ActivityAPISchema>;
export type ActivitySlack = z.infer<typeof ActivitySlackSchema>;
export type ActivityDetails = z.infer<typeof ActivityDetailsSchema>;

export type ActivityAttachments = z.infer<typeof ActivityAttachmentsSchema>;
export type ActivityFiles = z.infer<typeof ActivityFilesSchema>;
