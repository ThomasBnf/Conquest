import { z } from "zod";

export const FormWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
});

export type FormWorkflow = z.infer<typeof FormWorkflowSchema>;
