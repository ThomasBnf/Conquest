import type { channels as ChannelPrisma } from "@prisma/client";
import { z } from "zod";
import { SOURCE } from "./enum/source.enum";

export const ChannelSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string(),
  name: z.string(),
  source: SOURCE,
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<ChannelPrisma>;

export const ChannelWithActivitiesCountSchema = ChannelSchema.extend({
  _count: z.object({
    activities: z.number(),
  }),
});

export type Channel = z.infer<typeof ChannelSchema>;
export type ChannelWithActivitiesCount = z.infer<
  typeof ChannelWithActivitiesCountSchema
>;
