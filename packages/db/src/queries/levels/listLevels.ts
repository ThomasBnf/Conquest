import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { prisma } from "../../prisma";

type Props = {
  workspace_id: string;
};

export const listLevels = async ({ workspace_id }: Props) => {
  const levels = await prisma.level.findMany({
    where: {
      workspace_id,
    },
  });

  return LevelSchema.array().parse(levels);
};
