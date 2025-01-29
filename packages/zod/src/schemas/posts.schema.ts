import z from "zod";

export const PostSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string(),
  content: z.string(),
  author_id: z.string(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
});

export type Post = z.infer<typeof PostSchema>;
