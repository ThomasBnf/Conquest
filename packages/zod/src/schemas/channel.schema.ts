import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const ChannelSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  name: z.string(),
  source: SOURCE,
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Channel = z.infer<typeof ChannelSchema>;
