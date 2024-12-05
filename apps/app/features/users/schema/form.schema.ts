import { z } from "zod";

export const FormUserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
});

export type FormUserSchema = z.infer<typeof FormUserSchema>;
