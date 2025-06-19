import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId?: string;
};

export const listAllMembers = async ({ workspaceId }: Props) => {
  const members = await prisma.member.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return MemberSchema.array().parse(members);
};
