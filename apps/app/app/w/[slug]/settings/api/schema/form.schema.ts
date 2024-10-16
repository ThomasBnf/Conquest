import { z } from "zod";

export const FormAPISchema = z.object({
  name: z.string().min(1),
});

export type FormAPI = z.infer<typeof FormAPISchema>;
