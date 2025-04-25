import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../prisma";

type Props = {
  userId: string;
  workspaceId: string;
};

export const listLists = async ({ userId, workspaceId }: Props) => {
  const lists = await prisma.list.findMany({
    where: {
      createdBy: userId,
      workspaceId,
    },
  });

  return ListSchema.array().parse(lists);
};
