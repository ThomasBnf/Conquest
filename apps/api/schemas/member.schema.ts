import { GENDER } from "@conquest/zod/enum/gender.enum";
import { z } from "zod";

export const V1CreateMemberSchema = z.object({
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  primary_email: z.string().nullable(),
  discourse_id: z.string().nullable().optional(),
  livestorm_id: z.string().nullable().optional(),
  linkedin_id: z.string().nullable().optional(),
  slack_id: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  secondary_emails: z.array(z.string()).optional(),
  phones: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  gender: GENDER.nullable().optional(),
  company_id: z.string().cuid().nullable().optional(),
  deleted_at: z.coerce.date().nullable().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const V1UpdateMemberSchema = z.object({
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  primary_email: z.string().nullable().optional(),
  discourse_id: z.string().nullable().optional(),
  livestorm_id: z.string().nullable().optional(),
  linkedin_id: z.string().nullable().optional(),
  slack_id: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  secondary_emails: z.array(z.string()).optional(),
  phones: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  gender: GENDER.nullable().optional(),
  company_id: z.string().cuid().nullable().optional(),
  deleted_at: z.coerce.date().nullable().optional(),
});
