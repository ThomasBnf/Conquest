import { prisma } from "@/lib/prisma";

type Props = {
  slack_id: string;
};

export const getMember = async ({ slack_id }: Props) => {
  return await prisma.member.findUnique({
    where: {
      slack_id,
    },
  });
};
