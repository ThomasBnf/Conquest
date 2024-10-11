import { z } from "zod";

export const SOURCE = z.enum(["API", "MANUAL", "SLACK"]);
export const GENDER = z.enum(["MALE", "FEMALE", "OTHER"]);

export const ContactSchema = z.object({
  id: z.string().cuid(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string().nullable(),
  emails: z.array(z.string()).default([]),
  phone: z.string().nullable(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  job_title: z.string().nullable(),
  gender: GENDER.nullable(),
  address: z.string().nullable(),
  search: z.string(),
  source: SOURCE,
  tags: z.array(z.string()).default([]),
  slack_id: z.string().nullable(),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
  joined_at: z.date().nullable(),
});

export type Contact = z.infer<typeof ContactSchema>;
export type Source = z.infer<typeof SOURCE>;
export type Gender = z.infer<typeof GENDER>;
