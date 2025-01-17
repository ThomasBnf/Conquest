import { z } from "zod";

export const formListSchema = z.object({
  emoji: z.string(),
  name: z.string().min(1),
});

export type FormList = z.infer<typeof formListSchema>;
