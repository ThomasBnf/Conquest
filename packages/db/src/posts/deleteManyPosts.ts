import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const deleteManyPosts = async ({ workspaceId }: Props) => {
  await prisma.post.deleteMany({
    where: { workspaceId },
  });
};
