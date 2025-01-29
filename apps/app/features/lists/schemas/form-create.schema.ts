import { z } from "zod";

export const FormCreateSchema = z.object({
  emoji: z.string(),
  name: z.string().min(1),
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
