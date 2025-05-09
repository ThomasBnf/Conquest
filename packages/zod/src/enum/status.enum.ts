import { z } from "zod";

export const STATUS = z.enum([
  "ENABLED",
  "CONNECTED",
  "SYNCING",
  "DISCONNECTED",
  "FAILED",
]);

export type Status = z.infer<typeof STATUS>;
