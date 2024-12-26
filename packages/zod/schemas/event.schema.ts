import { z } from "zod";
import { SOURCE } from "./enum/source.enum";

export const EventSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  title: z.string(),
  started_at: z.coerce.date().nullable(),
  ended_at: z.coerce.date().nullable(),
  source: SOURCE,
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Event = z.infer<typeof EventSchema>;
