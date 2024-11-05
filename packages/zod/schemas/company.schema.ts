import { z } from "zod";

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  industry: z.string().nullable(),
  address: z.string().nullable(),
  domain: z.string().nullable(),
  employees: z.number().nullable(),
  founded_at: z.date().nullable(),
  workspace_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Company = z.infer<typeof CompanySchema>;
