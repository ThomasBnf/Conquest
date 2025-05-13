import { z } from "zod";

export const FormTaskSchema = z.object({
  task: z.string(),
  assignee: z.string().optional(),
});

export type FormTask = z.infer<typeof FormTaskSchema>;
