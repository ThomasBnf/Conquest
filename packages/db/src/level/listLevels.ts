import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const listLevels = async ({ workspaceId }: Props) => {
  const levels = await prisma.level.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      number: "desc",
    },
  });

  return LevelSchema.array().parse(levels);
};
