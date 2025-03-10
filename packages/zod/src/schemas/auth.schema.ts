import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
});

export type Login = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  email: z.string().email(),
});

export type SignupSchema = z.infer<typeof SignupSchema>;
