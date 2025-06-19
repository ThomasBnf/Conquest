import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { prisma } from "../prisma";

type Props = {
  name: string;
  workspaceId: string;
};

export const getTag = async ({ name, workspaceId }: Props) => {
  const tag = await prisma.tag.findFirst({
    where: {
      name,
      workspaceId,
    },
  });

  return TagSchema.parse(tag);
};
