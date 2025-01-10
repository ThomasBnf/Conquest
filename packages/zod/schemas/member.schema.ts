import type { members } from "@prisma/client";
import { z } from "zod";
import { GENDER } from "../enum/gender.enum";
import { SOURCE } from "../enum/source.enum";
import { CompanySchema } from "./company.schema";

export const LogSchema = z.object({
  date: z.string(),
  pulse: z.number(),
  presence: z.number(),
  level: z.number(),
  max_weight: z.number(),
  max_weight_activity: z.string(),
});

export const MemberSchema = z.object({
  id: z.string().cuid(),
  discord_id: z.string().nullable(),
  discourse_id: z.string().nullable(),
  livestorm_id: z.string().nullable(),
  linkedin_id: z.string().nullable(),
  slack_id: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  username: z.string().nullable(),
  location: z.string().nullable(),
  avatar_url: z.string().nullable(),
  job_title: z.string().nullable(),
  primary_email: z.string().nullable(),
  secondary_emails: z.array(z.string()),
  phones: z.array(z.string()),
  tags: z.array(z.string()),
  level: z.number(),
  pulse: z.number(),
  presence: z.number(),
  gender: GENDER.nullable(),
  source: SOURCE,
  logs: z.array(LogSchema),
  company_id: z.string().cuid().nullable(),
  workspace_id: z.string().cuid(),
  first_activity: z.coerce.date().nullable(),
  last_activity: z.coerce.date().nullable(),
  joined_at: z.coerce.date().nullable(),
  deleted_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<members>;

export const MemberWithCompanySchema = MemberSchema.extend({
  company: CompanySchema.nullable(),
});

export const CompanyWithMembersSchema = CompanySchema.extend({
  members: MemberSchema.array(),
});

export type Member = z.infer<typeof MemberSchema>;
export type MemberWithCompany = z.infer<typeof MemberWithCompanySchema>;
export type CompanyWithMembers = z.infer<typeof CompanyWithMembersSchema>;
export type Log = z.infer<typeof LogSchema>;
