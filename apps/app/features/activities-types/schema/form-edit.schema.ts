import { z } from "zod";

export const FormEditSchema = z.object({
  name: z.string().min(1),
  weight: z.coerce.number().min(0).max(12),
});

export type FormEdit = z.infer<typeof FormEditSchema>;
