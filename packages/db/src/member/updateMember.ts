import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../prisma";

type Props = Member;

export const updateMember = async ({ id, ...data }: Props) => {
  const member = await prisma.member.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });

  return MemberSchema.parse(member);
};
