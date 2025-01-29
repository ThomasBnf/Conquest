import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../../prisma";

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
