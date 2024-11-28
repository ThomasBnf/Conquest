import type { companies as CompanyPrisma } from "@prisma/client";
import { z } from "zod";
import { SOURCE } from "./enum/source.enum";
import { MemberSchema } from "./member.schema";

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string().nullable(),
  address: z.string().nullable(),
  domain: z.string().nullable(),
  employees: z.coerce.number().nullable(),
  founded_at: z.coerce.date().nullable(),
  logo_url: z.string().nullable(),
  tags: z.array(z.string()),
  source: SOURCE,
  workspace_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
}) satisfies z.ZodType<CompanyPrisma>;

export const CompanyWithMembersSchema = CompanySchema.extend({
  members: z.array(MemberSchema),
});

export type Company = z.infer<typeof CompanySchema>;
export type CompanyWithMembers = z.infer<typeof CompanyWithMembersSchema>;
