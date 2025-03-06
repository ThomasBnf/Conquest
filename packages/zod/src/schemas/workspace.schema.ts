import type { workspace as WorkspacePrisma } from "@prisma/client";
import { z } from "zod";
import { PLAN } from "../enum/plan.enum";

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  source: z.string().nullable(),
  company_size: z.string().nullable(),
  plan: PLAN,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<WorkspacePrisma>;

export type Workspace = z.infer<typeof WorkspaceSchema>;
