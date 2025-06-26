import { prisma } from "../prisma";

type Props =
  | {
      id: string;
    }
  | {
      externalId: string;
      workspaceId: string;
    };

export const deleteTag = async (props: Props) => {
  const tag = await prisma.tag.findFirst({
    where:
      "id" in props
        ? { id: props.id }
        : { externalId: props.externalId, workspaceId: props.workspaceId },
  });

  if (!tag) return;

  await prisma.tag.delete({
    where: { id: tag.id },
  });

  const members = await prisma.member.findMany({
    where: { tags: { has: tag.id } },
  });

  for (const member of members) {
    await prisma.member.update({
      where: { id: member.id },
      data: {
        tags: member.tags.filter((tagId) => tagId !== tag.id),
      },
    });
  }
};
