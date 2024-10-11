import { z } from "zod";

export const FormNameSchema = z.object({
  name: z.string().min(1),
});

export type FormName = z.infer<typeof FormNameSchema>;
