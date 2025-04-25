import type { Workspace as WorkspacePrisma } from "@prisma/client";
import { z } from "zod";
import { PLAN } from "../enum/plan.enum";

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  source: z.string().nullable(),
  companySize: z.string().nullable(),
  plan: PLAN.nullable(),
  stripeCustomerId: z.string().nullable(),
  priceId: z.string().nullable(),
  trialEnd: z.coerce.date().nullable(),
  isPastDue: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<WorkspacePrisma>;

export type Workspace = z.infer<typeof WorkspaceSchema>;
