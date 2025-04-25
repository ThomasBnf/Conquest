import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const listTags = async ({ workspaceId }: Props) => {
  const tags = await prisma.tag.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return TagSchema.array().parse(tags);
};
