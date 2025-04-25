import { z } from "zod";

export const FormUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

export type FormUserSchema = z.infer<typeof FormUserSchema>;
