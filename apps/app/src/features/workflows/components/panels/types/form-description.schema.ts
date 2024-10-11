import { z } from "zod";

export const FormDescriptionSchema = z.object({
  description: z.string().optional(),
});

export type FormDescription = z.infer<typeof FormDescriptionSchema>;
