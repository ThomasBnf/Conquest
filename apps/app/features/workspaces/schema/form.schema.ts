import { z } from "zod";

export const FormWorkspaceSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export type FormWorkspaceSchema = z.infer<typeof FormWorkspaceSchema>;
