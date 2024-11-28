import type { apikeys as APIKeyPrisma } from "@prisma/client";
import { z } from "zod";

export const APIKeySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  token: z.string(),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
}) satisfies z.ZodType<APIKeyPrisma>;

export type APIKey = z.infer<typeof APIKeySchema>;
