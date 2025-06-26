import { z } from "zod";
import { SOURCE } from "../enum/source.enum";
import { CustomFieldRecordSchema } from "./custom-field.schema";

export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  industry: z.string().nullable(),
  address: z.string().nullable(),
  domain: z.string().nullable(),
  employees: z.number().nullable(),
  foundedAt: z.coerce.date().nullable(),
  logoUrl: z.string().nullable(),
  tags: z.array(z.string()),
  source: SOURCE,
  customFields: z.array(CustomFieldRecordSchema),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Company = z.infer<typeof CompanySchema>;
