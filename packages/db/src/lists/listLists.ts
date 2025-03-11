import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../prisma";

type Props = {
  user_id: string;
};

export const listLists = async ({ user_id }: Props) => {
  const lists = await prisma.list.findMany({});

  return ListSchema.array().parse(lists);
};
