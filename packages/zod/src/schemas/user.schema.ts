import type { user as UserPrisma } from "@prisma/client";
import { z } from "zod";
import { ROLE } from "../enum/role.enum";
import { GroupFiltersSchema } from "./filters.schema";
import { WorkspaceSchema } from "./workspace.schema";
export const PreferencesSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
  pageSize: z.number(),
  groupFilters: GroupFiltersSchema,
  columnVisibility: z.record(z.string(), z.boolean()),
  columnOrder: z.array(z.string()),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailVerified: z.coerce.date().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  onboarding: z.coerce.date().nullable(),
  role: ROLE,
  last_activity_at: z.coerce.date(),
  members_preferences: PreferencesSchema,
  companies_preferences: PreferencesSchema,
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<UserPrisma>;

export const UserWithWorkspaceSchema = UserSchema.extend({
  workspace: WorkspaceSchema,
});

export type User = z.infer<typeof UserSchema>;
export type UserWithWorkspace = z.infer<typeof UserWithWorkspaceSchema>;
export type Preferences = z.infer<typeof PreferencesSchema>;
