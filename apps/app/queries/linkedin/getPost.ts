import { prisma } from "@/lib/prisma";
import { PostSchema } from "@conquest/zod/schemas/posts.schema";

type Props = {
  urn: string;
  workspace_id: string;
};
export const getPost = async ({ urn, workspace_id }: Props) => {
  const post = await prisma.posts.findUnique({
    where: {
      external_id_workspace_id: {
        external_id: urn,
        workspace_id,
      },
    },
  });

  if (!post) return null;

  return PostSchema.parse(post);
};
