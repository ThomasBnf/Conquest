import { prisma } from "../prisma";

type Props = {
  workspace_id: string;
};

export const deleteManyPosts = async ({ workspace_id }: Props) => {
  await prisma.post.deleteMany({
    where: { workspace_id },
  });
};
