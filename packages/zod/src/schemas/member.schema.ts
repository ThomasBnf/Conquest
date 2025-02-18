import type { member } from "@prisma/client";
import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const LogSchema = z.object({
  date: z.string(),
  pulse: z.number(),
  levelId: z.string().cuid().nullable(),
});

export const MemberSchema = z.object({
  id: z.string().cuid(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  primary_email: z.string().nullable(),
  secondary_emails: z.array(z.string()),
  phones: z.array(z.string()),
  job_title: z.string().nullable(),
  avatar_url: z.string().nullable(),
  country: z.string().nullable(),
  language: z.string().nullable(),
  tags: z.array(z.string()),
  linkedin_url: z.string().nullable(),
  level_id: z.string().cuid().nullable(),
  pulse: z.number(),
  logs: z.array(LogSchema),
  source: SOURCE,
  company_id: z.string().cuid().nullable(),
  workspace_id: z.string().cuid(),
  first_activity: z.date().nullable(),
  last_activity: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
}) satisfies z.ZodType<member>;

export type Member = z.infer<typeof MemberSchema>;
export type Log = z.infer<typeof LogSchema>;
