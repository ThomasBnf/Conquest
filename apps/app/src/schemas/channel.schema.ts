import { z } from "zod";

export const ChannelSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  external_id: z.string().nullable(),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Channel = z.infer<typeof ChannelSchema>;
