import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../prisma";

type Props = {
  user_id: string;
  workspace_id: string;
};

export const listLists = async ({ user_id, workspace_id }: Props) => {
  const lists = await prisma.list.findMany({
    where: {
      created_by: user_id,
      workspace_id,
    },
  });

  return ListSchema.array().parse(lists);
};
