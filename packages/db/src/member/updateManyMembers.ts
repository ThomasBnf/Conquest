import type { Member } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../prisma";

type Props = {
  members: Member[];
};

export const updateManyMembers = async ({ members }: Props) => {
  await prisma.$transaction(
    members.map(({ id, ...data }) =>
      prisma.member.update({
        where: { id },
        data: {
          ...data,
        },
      }),
    ),
  );
};
