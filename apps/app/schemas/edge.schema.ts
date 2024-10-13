import { z } from "zod";

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string(),
});

export type Edge = z.infer<typeof EdgeSchema>;
