import { z } from "zod";

export const SourceSchema = z.enum([
  "google",
  "twitter",
  "linkedin",
  "reddit",
  "youtube",
  "friend",
]);

export const CompanySizeSchema = z.enum([
  "just_me",
  "1-5",
  "5-25",
  "25-100",
  "100-250",
  "250-1000",
  "1000+",
]);

export const WorkspaceSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  workspace_name: z.string().min(1),
  slug: z.string(),
});

export const QuestionsSchema = z.object({
  source: SourceSchema,
  company_size: CompanySizeSchema,
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type Questions = z.infer<typeof QuestionsSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type CompanySize = z.infer<typeof CompanySizeSchema>;
