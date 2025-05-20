import type { User as UserPrisma } from "@prisma/client";
import { z } from "zod";
import { ROLE } from "../enum/role.enum";
import { GroupFiltersSchema } from "./filters.schema";

export const PreferencesSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
  groupFilters: GroupFiltersSchema,
  columnVisibility: z.record(z.string(), z.boolean()),
  columnOrder: z.array(z.string()),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailVerified: z.coerce.date().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  onboarding: z.coerce.date().nullable(),
  role: ROLE,
  lastActivityAt: z.coerce.date(),
  membersPreferences: PreferencesSchema,
  companiesPreferences: PreferencesSchema,
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<UserPrisma>;

export type User = z.infer<typeof UserSchema>;
export type Preferences = z.infer<typeof PreferencesSchema>;
