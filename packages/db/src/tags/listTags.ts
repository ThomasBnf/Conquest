import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { prisma } from "../prisma";

type Props = {
  workspace_id: string;
};

export const listTags = async ({ workspace_id }: Props) => {
  const tags = await prisma.tag.findMany({
    where: {
      workspace_id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return TagSchema.array().parse(tags);
};
