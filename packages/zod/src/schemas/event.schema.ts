import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const EventSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  title: z.string(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().nullable(),
  source: SOURCE,
  workspaceId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Event = z.infer<typeof EventSchema>;
