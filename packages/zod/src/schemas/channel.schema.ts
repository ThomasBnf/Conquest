import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const ChannelSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  name: z.string(),
  source: SOURCE,
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Channel = z.infer<typeof ChannelSchema>;
