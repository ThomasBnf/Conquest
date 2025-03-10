import type { List } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../prisma";

type Props = { id: string } & Partial<List>;

export const updateList = async ({ id, ...data }: Props) => {
  await prisma.list.update({
    where: { id },
    data,
  });
};
