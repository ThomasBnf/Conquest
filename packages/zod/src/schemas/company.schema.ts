import { z } from "zod";
import { SOURCE } from "../enum/source.enum";
import { CustomFieldRecordSchema } from "./custom-field.schema";

export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  industry: z.string(),
  address: z.string(),
  domain: z.string(),
  employees: z.string(),
  foundedAt: z.coerce.date().nullable(),
  logoUrl: z.string(),
  tags: z.array(z.string()),
  source: SOURCE,
  customFields: z.object({
    fields: z.array(CustomFieldRecordSchema),
  }),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Company = z.infer<typeof CompanySchema>;
