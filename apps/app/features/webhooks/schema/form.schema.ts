import { z } from "zod";

export const FormWebhookSchema = z.object({
  trigger: z.string().min(1),
  url: z.string().min(1),
  secret: z.string().min(1),
});

export type FormWebhook = z.infer<typeof FormWebhookSchema>;
