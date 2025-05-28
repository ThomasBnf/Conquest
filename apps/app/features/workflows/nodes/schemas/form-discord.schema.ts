import { z } from "zod";

export const FormDiscordSchema = z.object({
  message: z.string(),
});

export type FormDiscord = z.infer<typeof FormDiscordSchema>;
