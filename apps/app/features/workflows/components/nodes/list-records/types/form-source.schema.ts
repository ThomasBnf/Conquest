import { z } from "zod";

export const FormSourceSchema = z.object({
  source: z.enum(["members", "activities"]),
});

export type FormSource = z.infer<typeof FormSourceSchema>;
