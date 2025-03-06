import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const getList = async ({ id }: Props) => {
  const list = await prisma.list.findUnique({
    where: { id },
  });

  if (!list) return undefined;
  return ListSchema.parse(list);
};
