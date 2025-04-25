import { z } from "zod";

export const BulkActivitySchema = z.object({
  activityTypeKey: z.string(),
  message: z.string(),
});

export type BulkActivity = z.infer<typeof BulkActivitySchema>;
