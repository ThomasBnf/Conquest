import { z } from "zod";

export const LogSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  pulse: z.number(),
  level: z.number().nullable(),
  memberId: z.string(),
  workspaceId: z.string(),
});

export type Log = z.infer<typeof LogSchema>;
