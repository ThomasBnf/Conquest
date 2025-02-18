import { z } from "zod";

export const FormLevelSchema = z.object({
  name: z.string().min(1),
  number: z.coerce.number().min(0),
  from: z.coerce.number().min(0),
  to: z.coerce.number().max(Number.POSITIVE_INFINITY).optional(),
});

export type FormLevel = z.infer<typeof FormLevelSchema>;
