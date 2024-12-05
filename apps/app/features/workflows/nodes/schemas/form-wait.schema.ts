import { z } from "zod";

export const FormWaitSchema = z.object({
  duration: z.coerce.number(),
  unit: z.enum(["seconds", "minutes", "hours", "days"]),
});

export type FormWait = z.infer<typeof FormWaitSchema>;
