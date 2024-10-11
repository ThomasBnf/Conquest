import { z } from "zod";
import { WorkspaceSchema } from "./workspace.schema";

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  hashed_password: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string().nullable(),
  onboarding: z.date().nullable(),
  date_range: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  }),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const UserWithWorkspaceSchema = UserSchema.extend({
  workspace: WorkspaceSchema,
});

export type User = z.infer<typeof UserSchema>;
export type UserWithWorkspace = z.infer<typeof UserWithWorkspaceSchema>;
