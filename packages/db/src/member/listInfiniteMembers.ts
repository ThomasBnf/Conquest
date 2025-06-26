import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../prisma";

type Props = {
  cursor?: number | null | undefined;
  search: string;
  workspaceId: string;
};

export const listInfiniteMembers = async ({
  cursor,
  search,
  workspaceId,
}: Props) => {
  const members = await prisma.member.findMany({
    where: {
      workspaceId,
      OR: [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          primaryEmail: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      firstName: "asc",
    },
    take: 25,
    ...(cursor && { skip: cursor }),
  });

  return MemberSchema.array().parse(members);
};
