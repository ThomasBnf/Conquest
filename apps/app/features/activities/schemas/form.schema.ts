import { z } from "zod";

export const FormCreateSchema = z.object({
  activity_type_key: z.string(),
  message: z.string(),
  member_id: z.string(),
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
