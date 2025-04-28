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

  const safeParse = ListSchema.array().safeParse(lists);

  if (!safeParse.success) {
    console.error(safeParse.error);
  }

  return safeParse.data;
};
