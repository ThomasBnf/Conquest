import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  industry: z.string(),
  address: z.string(),
  domain: z.string(),
  employees: z.coerce.number().nullable(),
  founded_at: z.coerce.date().nullable(),
  logo_url: z.string(),
  tags: z.array(z.string()),
  source: SOURCE,
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Company = z.infer<typeof CompanySchema>;
