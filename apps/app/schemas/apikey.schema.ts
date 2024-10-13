import { z } from "zod";

export const APIKeySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  token: z.string(),
  user_id: z.string().cuid(),
  created_at: z.date(),
});

export type APIKey = z.infer<typeof APIKeySchema>;
