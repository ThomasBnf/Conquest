import { z } from "zod";

export const APIKeySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  token: z.string(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
});

export type APIKey = z.infer<typeof APIKeySchema>;
