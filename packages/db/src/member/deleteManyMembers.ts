import { prisma } from "../prisma";

type Props = {
  ids: string[];
};

export const deleteManyMembers = async ({ ids }: Props) => {
  await prisma.$transaction(async (tx) => {
    await tx.profile.deleteMany({
      where: {
        memberId: {
          in: ids,
        },
      },
    });

    await tx.activity.deleteMany({
      where: {
        memberId: {
          in: ids,
        },
      },
    });

    await tx.member.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    await tx.duplicate.deleteMany({
      where: {
        memberIds: {
          hasSome: ids,
        },
      },
    });
  });

  return { success: true };
};
