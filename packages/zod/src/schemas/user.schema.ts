import type { users as UserPrisma } from "@prisma/client";
import { z } from "zod";
import { ROLE } from "../enum/role.enum";
import { WorkspaceSchema } from "./workspace.schema";

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  hashed_password: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  onboarding: z.date().nullable(),
  role: ROLE,
  last_seen: z.date().nullable(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<UserPrisma>;

export const UserWithWorkspaceSchema = UserSchema.extend({
  workspace: WorkspaceSchema,
});

export type User = z.infer<typeof UserSchema>;
export type UserWithWorkspace = z.infer<typeof UserWithWorkspaceSchema>;
