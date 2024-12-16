import { z } from "zod";

export const FormLivestormSchema = z.object({
  api_key: z.string(),
});

export type FormLivestorm = z.infer<typeof FormLivestormSchema>;
