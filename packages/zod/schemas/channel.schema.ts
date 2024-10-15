import { z } from "zod";
import { SOURCE } from "./source.enum";

export const ChannelSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string(),
  name: z.string(),
  source: SOURCE,
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Channel = z.infer<typeof ChannelSchema>;
