import { z } from "zod";

export const FormSourceSchema = z.object({
  source: z.enum(["contacts", "activities"]),
});

export type FormSource = z.infer<typeof FormSourceSchema>;
