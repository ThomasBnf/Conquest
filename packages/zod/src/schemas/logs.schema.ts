import { z } from "zod";

export const LogSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  pulse: z.number(),
  level_id: z.string().nullable(),
  member_id: z.string(),
  workspace_id: z.string(),
});

export type Log = z.infer<typeof LogSchema>;
