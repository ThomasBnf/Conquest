import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteMember = async ({ id }: Props) => {
  await prisma.$transaction(async (tx) => {
    await tx.profile.deleteMany({
      where: {
        memberId: id,
      },
    });

    await tx.activity.deleteMany({
      where: {
        OR: [{ inviteTo: id }, { memberId: id }],
      },
    });

    await tx.member.delete({
      where: {
        id,
      },
    });

    await tx.duplicate.deleteMany({
      where: {
        memberIds: {
          has: id,
        },
      },
    });
  });
};
