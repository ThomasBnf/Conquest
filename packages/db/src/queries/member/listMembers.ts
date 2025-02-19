import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../../prisma";

type Props = {
  workspace_id: string;
};

export const listMembers = async ({ workspace_id }: Props) => {
  const members = await prisma.member.findMany({ where: { workspace_id } });

  return MemberSchema.array().parse(members);
};
