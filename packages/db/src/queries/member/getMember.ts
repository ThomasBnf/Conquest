import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../../prisma";

type Props = {
  id: string;
};

export const getMember = async ({ id }: Props) => {
  const member = await prisma.member.findUnique({
    where: {
      id,
    },
  });

  if (!member) return null;
  return MemberSchema.parse(member);
};
