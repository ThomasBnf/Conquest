import { z } from "zod";

export const FormDaysSchema = z.object({
  days: z.number().default(1),
});

export type FormDays = z.infer<typeof FormDaysSchema>;
