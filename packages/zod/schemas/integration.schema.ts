import { z } from "zod";
import { SOURCE } from "./source.enum";

export const IntegrationSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string(),
  name: z.string(),
  source: SOURCE,
  token: z.string(),
  scopes: z.string(),
  installed_at: z.date().nullable(),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Integration = z.infer<typeof IntegrationSchema>;
