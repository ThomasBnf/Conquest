import type { api_key } from "@prisma/client";
import { z } from "zod";

export const APIKeySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  token: z.string(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
}) satisfies z.ZodType<api_key>;

export type APIKey = z.infer<typeof APIKeySchema>;
