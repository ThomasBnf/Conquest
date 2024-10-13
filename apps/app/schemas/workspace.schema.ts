import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  guild_id: z.string().nullable(),
  source: z.string().nullable(),
  slack_token: z.string().nullable(),
  slug: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
