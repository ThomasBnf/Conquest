import { z } from "zod";

export const FormWebhookSchema = z.object({
  url: z.string().url().optional(),
  body: z.string().optional(),
});

export type FormWebhook = z.infer<typeof FormWebhookSchema>;
