import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  redirectTo: z.string().optional(),
});

export type Login = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignupSchema = z.infer<typeof SignupSchema>;
