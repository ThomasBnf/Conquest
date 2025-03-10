import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
} & Partial<Tag>;

export const updateTag = async ({ id, ...data }: Props) => {
  await prisma.tag.update({
    where: {
      id,
    },
    data,
  });
};
