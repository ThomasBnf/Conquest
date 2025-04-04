import { z } from "zod";

export const BulkActivitySchema = z.object({
  activity_type_key: z.string(),
  message: z.string(),
});

export type BulkActivity = z.infer<typeof BulkActivitySchema>;
