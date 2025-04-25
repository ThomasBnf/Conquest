import z from "zod";

export const PostSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  content: z.string(),
  authorId: z.string(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
});

export type Post = z.infer<typeof PostSchema>;
