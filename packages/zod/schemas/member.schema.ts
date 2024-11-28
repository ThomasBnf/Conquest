import type { members } from "@prisma/client";
import { z } from "zod";
import { GENDER } from "./enum/gender.enum";
import { SOURCE } from "./enum/source.enum";

export const MemberSchema = z.object({
  id: z.string().cuid(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string().nullable(),
  username: z.string().nullable(),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  localisation: z.string().nullable(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  job_title: z.string().nullable(),
  gender: GENDER.nullable(),
  search: z.string(),
  source: SOURCE,
  tags: z.array(z.string()),
  company_id: z.string().cuid().nullable(),
  discourse_id: z.string().nullable(),
  slack_id: z.string().nullable(),
  workspace_id: z.string().cuid(),
  joined_at: z.coerce.date().nullable(),
  deleted_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<members>;

export type Member = z.infer<typeof MemberSchema>;
