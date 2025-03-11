import type { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { prisma } from "../prisma";

type Props = {
  emoji: string;
  name: string;
  groupFilters: GroupFilters;
  workspace_id: string;
  created_by: string;
};

export const createList = async ({
  emoji,
  name,
  groupFilters,
  created_by,
  workspace_id,
}: Props) => {
  const list = await prisma.list.create({
    data: {
      emoji,
      name,
      groupFilters,
      created_by,
      workspace_id,
    },
  });

  return ListSchema.parse(list);
};
