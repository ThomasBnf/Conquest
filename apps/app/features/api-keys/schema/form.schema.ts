import { z } from "zod";

export const FormApiKeySchema = z.object({
  name: z.string().min(1),
});

export type FormApiKey = z.infer<typeof FormApiKeySchema>;
