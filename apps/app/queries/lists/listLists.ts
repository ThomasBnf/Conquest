import { prisma } from "@/lib/prisma";
import { ListSchema } from "@conquest/zod/schemas/list.schema";

type Props = {
  workspace_id: string;
};

export const listLists = async ({ workspace_id }: Props) => {
  const lists = await prisma.lists.findMany({
    where: {
      workspace_id,
    },
  });

  return ListSchema.array().parse(lists);
};
