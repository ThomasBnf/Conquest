import type { workspaces as WorkspacePrisma } from "@prisma/client";
import { z } from "zod";
import { IntegrationSchema } from "./integration.schema";

export const WorkspaceSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  source: z.string().nullable(),
  company_size: z.string().nullable(),
  slug: z.string(),
  integrations: z.array(IntegrationSchema).default([]),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<WorkspacePrisma>;

export type Workspace = z.infer<typeof WorkspaceSchema>;
