import { z } from "zod";

export const FormSlackSchema = z.object({
  message: z.string(),
});

export type FormSlack = z.infer<typeof FormSlackSchema>;
