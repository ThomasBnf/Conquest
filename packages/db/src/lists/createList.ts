import type { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../prisma";

type Props = {
  emoji: string;
  name: string;
  groupFilters: GroupFilters;
  workspaceId: string;
  createdBy: string;
};

export const createList = async ({
  emoji,
  name,
  groupFilters,
  createdBy,
  workspaceId,
}: Props) => {
  const list = await prisma.list.create({
    data: {
      emoji,
      name,
      groupFilters,
      createdBy,
      workspaceId,
    },
  });

  return ListSchema.parse(list);
};
