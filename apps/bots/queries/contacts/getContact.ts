import { prisma } from "@/lib/prisma";

type Props = {
  slack_id: string;
};

export const getContact = async ({ slack_id }: Props) => {
  return await prisma.contact.findUnique({
    where: {
      slack_id,
    },
  });
};
