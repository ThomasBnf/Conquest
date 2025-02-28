import { z } from "zod";

export const APIKeySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  token: z.string(),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
});

export type APIKey = z.infer<typeof APIKeySchema>;
