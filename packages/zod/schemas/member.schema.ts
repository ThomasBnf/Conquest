import type { members } from "@prisma/client";
import { z } from "zod";
import { GENDER } from "./enum/gender.enum";
import { SOURCE } from "./enum/source.enum";

export const MemberSchema = z.object({
  id: z.string().cuid(),
  slack_id: z.string().nullable(),
  discourse_id: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string().nullable(),
  username: z.string().nullable(),
  localisation: z.string().nullable(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  job_title: z.string().nullable(),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  tags: z.array(z.string()),
  level: z.number(),
  love: z.number(),
  presence: z.number(),
  search: z.string(),
  gender: GENDER.nullable(),
  source: SOURCE,
  company_id: z.string().cuid().nullable(),
  workspace_id: z.string().cuid(),
  first_activity: z.coerce.date().nullable(),
  last_activity: z.coerce.date().nullable(),
  joined_at: z.coerce.date().nullable(),
  deleted_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<members>;

export type Member = z.infer<typeof MemberSchema>;
