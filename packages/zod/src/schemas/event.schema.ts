import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const EventSchema = z.object({
  id: z.string().uuid(),
  external_id: z.string(),
  title: z.string(),
  started_at: z.coerce.date(),
  ended_at: z.coerce.date().nullable(),
  source: SOURCE,
  workspace_id: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Event = z.infer<typeof EventSchema>;
