import { z } from "zod";

export const FormEditSchema = z.object({
  id: z.string().uuid(),
  emoji: z.string(),
  name: z.string().min(1),
});

export type FormEdit = z.infer<typeof FormEditSchema>;
