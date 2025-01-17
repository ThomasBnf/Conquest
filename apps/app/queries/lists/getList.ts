import { prisma } from "@/lib/prisma";
import { ListSchema } from "@conquest/zod/schemas/list.schema";

type Props = {
  list_id: string;
  workspace_id: string;
};

export const getList = async ({ workspace_id, list_id }: Props) => {
  const list = await prisma.lists.findUnique({
    where: {
      id: list_id,
      workspace_id,
    },
  });

  return ListSchema.parse(list);
};
