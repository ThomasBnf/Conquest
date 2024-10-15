import { z } from "zod";

export const OrganizationSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
