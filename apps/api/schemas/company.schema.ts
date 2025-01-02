import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const V1CreateCompanySchema = z.object({
  name: z.string(),
  source: SOURCE,
  industry: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  employees: z.coerce.number().nullable().optional(),
  founded_at: z.coerce.date().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const V1UpdateCompanySchema = z.object({
  name: z.string().optional(),
  source: SOURCE.optional(),
  industry: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  employees: z.coerce.number().nullable().optional(),
  founded_at: z.coerce.date().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});
