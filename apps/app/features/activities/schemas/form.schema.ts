import { z } from "zod";

export const FormCreateSchema = z.object({
  message: z.string(),
  activity_type_key: z.string(),
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
