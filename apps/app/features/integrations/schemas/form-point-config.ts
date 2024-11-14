import { z } from "zod";

export const FormPointConfigSchema = z.object({
  post: z.coerce.number().min(0),
  reply: z.coerce.number().min(0),
  reaction: z.coerce.number().min(0),
  invitation: z.coerce.number().min(0),
});

export type FormPointConfig = z.infer<typeof FormPointConfigSchema>;
