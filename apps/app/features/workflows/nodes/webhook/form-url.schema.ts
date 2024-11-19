import { z } from "zod";

export const FormUrlSchema = z.object({
  url: z.string().url().optional(),
  body: z.string().optional(),
});

export type FormUrl = z.infer<typeof FormUrlSchema>;
