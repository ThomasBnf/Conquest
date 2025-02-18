import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../../prisma";

type Props = {
  list_id: string;
  workspace_id: string;
};

export const getList = async ({ workspace_id, list_id }: Props) => {
  const list = await prisma.list.findUnique({
    where: {
      id: list_id,
      workspace_id,
    },
  });

  return ListSchema.parse(list);
};
