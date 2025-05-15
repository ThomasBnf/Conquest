import { z } from "zod";

export const EdgeSchema = z.object({
  id: z.string(),
  type: z.literal("custom"),
  source: z.string(),
  target: z.string(),
  data: z
    .object({
      condition: z.enum(["true", "false"]),
    })
    .optional(),
  label: z.string().optional(),
});

export type Edge = z.infer<typeof EdgeSchema>;
