import { z } from "zod";

export const FormCreateSchema = z.object({
  filter: z.string().optional(),
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
