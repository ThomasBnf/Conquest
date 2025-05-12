import { z } from "zod";

export const FormTagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
});

export type FormTag = z.infer<typeof FormTagSchema>;
