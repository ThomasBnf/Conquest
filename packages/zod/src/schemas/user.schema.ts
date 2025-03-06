import type { user as UserPrisma } from "@prisma/client";
import { z } from "zod";
import { ROLE } from "../enum/role.enum";
import { GroupFiltersSchema } from "./filters.schema";

export const PreferencesSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
  pageSize: z.number(),
  groupFilters: GroupFiltersSchema,
  columnVisibility: z.record(z.string(), z.boolean()),
  columnOrder: z.array(z.string()),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  hashed_password: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  onboarding: z.date().nullable(),
  role: ROLE,
  last_seen: z.date(),
  members_preferences: PreferencesSchema,
  companies_preferences: PreferencesSchema,
  workspace_id: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<UserPrisma>;

export type User = z.infer<typeof UserSchema>;
export type Preferences = z.infer<typeof PreferencesSchema>;
