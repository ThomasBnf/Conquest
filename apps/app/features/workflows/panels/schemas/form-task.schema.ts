import { z } from "zod";

export const FormTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  days: z.number(),
  assignee: z.string(),
});

export type FormTask = z.infer<typeof FormTaskSchema>;
