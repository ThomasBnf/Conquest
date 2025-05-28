import { z } from "zod";

export const FormWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  alertOnSuccess: z.boolean(),
  alertOnFailure: z.boolean(),
});

export type FormWorkflow = z.infer<typeof FormWorkflowSchema>;
