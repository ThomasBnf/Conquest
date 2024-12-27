import { prisma } from "@conquest/database";
import { TagSchema } from "@conquest/zod/tag.schema";

type Props = {
  workspace_id: string;
};

export const listTags = async ({ workspace_id }: Props) => {
  const tags = await prisma.tags.findMany({
    where: {
      workspace_id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return TagSchema.array().parse(tags);
};
