import { prisma } from "../prisma";

type Props = {
  name: string;
  number: number;
  from: number;
  to?: number;
  workspaceId: string;
};

export const createLevel = async ({
  name,
  number,
  from,
  to,
  workspaceId,
}: Props) => {
  await prisma.level.create({
    data: {
      name,
      number,
      from,
      to,
      workspaceId,
    },
  });
};
