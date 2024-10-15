import { z } from "zod";
import { IntegrationSchema } from "./integration.schema";

export const WorkspaceSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  source: z.string().nullable(),
  slug: z.string(),
  integrations: z.array(IntegrationSchema).default([]),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
