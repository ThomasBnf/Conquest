import { prisma } from "@/lib/prisma";
import { PostSchema } from "@conquest/zod/schemas/posts.schema";

type Props = {
  external_id: string;
  content: string;
  author_id: string;
  workspace_id: string;
  created_at: number;
};

export const createPost = async ({
  external_id,
  content,
  author_id,
  workspace_id,
  created_at,
}: Props) => {
  const post = await prisma.posts.create({
    data: {
      external_id,
      content,
      author_id,
      workspace_id,
      created_at: new Date(created_at),
    },
  });

  return PostSchema.parse(post);
};
