import { z } from "zod";
import { ROLE } from "../enum/role.enum";
import { GroupFiltersSchema } from "./filters.schema";

export const PreferencesSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
  pageSize: z.coerce.number(),
  groupFilters: GroupFiltersSchema,
  columnVisibility: z.record(z.string(), z.boolean()).default({}),
  columnOrder: z.array(z.string()).default([]),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  hashed_password: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  onboarding: z.coerce.date().nullable(),
  role: ROLE,
  last_seen: z.coerce.date(),
  members_preferences: PreferencesSchema,
  companies_preferences: PreferencesSchema,
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Preferences = z.infer<typeof PreferencesSchema>;
