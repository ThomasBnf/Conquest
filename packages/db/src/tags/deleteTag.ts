import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteTag = async ({ id }: Props) => {
  await prisma.tag.delete({
    where: { id },
  });

  const members = await prisma.member.findMany({
    where: { tags: { has: id } },
  });

  for (const member of members) {
    await prisma.member.update({
      where: { id: member.id },
      data: {
        tags: member.tags.filter((tagId) => tagId !== id),
      },
    });
  }
};
