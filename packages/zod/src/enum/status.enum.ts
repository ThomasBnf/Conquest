import { z } from "zod";

export const STATUS = z.enum([
  "ENABLED",
  "CONNECTED",
  "SYNCING",
  "DISCONNECTED",
]);

export type Status = z.infer<typeof STATUS>;
