import { z } from "zod";

export const FormCreateSchema = z.object({
  name: z.string().min(1),
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
