import type { workspaces as WorkspacePrisma } from "@prisma/client";
import { z } from "zod";
import { FilterSchema } from "./filters.schema";
import { IntegrationSchema } from "./integration.schema";

export const MembersPreferencesSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
  pageSize: z.number(),
  filters: z.array(FilterSchema).default([]),
});

export const WorkspaceSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  source: z.string().nullable(),
  company_size: z.string().nullable(),
  members_preferences: MembersPreferencesSchema,
  integrations: z.array(IntegrationSchema).default([]),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<WorkspacePrisma>;

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type MembersPreferences = z.infer<typeof MembersPreferencesSchema>;
