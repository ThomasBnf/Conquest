import { z } from "zod";
import { SOURCE } from "./source.enum";

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string().nullable(),
  address: z.string().nullable(),
  domain: z.string().nullable(),
  employees: z.number().nullable(),
  founded_at: z.date().nullable(),
  logo_url: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  source: SOURCE,
  workspace_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Company = z.infer<typeof CompanySchema>;
