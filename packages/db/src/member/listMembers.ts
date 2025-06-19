import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
  companyId?: string;
  offset?: number;
  limit?: number;
};

export const listMembers = async ({
  workspaceId,
  companyId,
  offset,
  limit,
}: Props) => {
  const members = await prisma.member.findMany({
    where: {
      workspaceId,
      ...(companyId && { companyId }),
    },
    ...(limit && { take: limit }),
    ...(offset && { skip: offset }),
  });

  return MemberSchema.array().parse(members);
};
