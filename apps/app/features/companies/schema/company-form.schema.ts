import { z } from "zod";

export const CompanyFormSchema = z.object({
  name: z.string().min(1),
});

export type CompanyForm = z.infer<typeof CompanyFormSchema>;
