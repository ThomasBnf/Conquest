import { z } from "zod";

export const csvInfoSchema = z.object({
  name: z.string(),
  rows: z.array(z.record(z.string(), z.unknown())),
  columns: z.array(z.string()),
  headers: z.array(z.string()),
});

export type CSVInfo = z.infer<typeof csvInfoSchema>;
