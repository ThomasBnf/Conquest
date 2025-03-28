import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const MemberSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  primary_email: z.string(),
  secondary_emails: z.array(z.string()),
  phones: z.array(z.string()),
  job_title: z.string(),
  avatar_url: z.string(),
  country: z.string(),
  language: z.string(),
  tags: z.array(z.string().uuid()),
  linkedin_url: z.string(),
  level_id: z.string().nullable(),
  pulse: z.number(),
  source: SOURCE,
  company_id: z.string().nullable(),
  workspace_id: z.string(),
  first_activity: z.coerce.date().nullable(),
  last_activity: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Member = z.infer<typeof MemberSchema>;
