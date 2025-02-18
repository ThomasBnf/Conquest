import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { prisma } from "../../prisma";

type Props = {
  pulse: number;
  workspace_id: string;
};

export const getLevel = async ({ pulse, workspace_id }: Props) => {
  const level = await prisma.level.findFirst({
    where: {
      AND: [
        { from: { lte: pulse } },
        {
          OR: [{ to: { gte: pulse } }, { to: null }],
        },
      ],
      workspace_id,
    },
  });

  return LevelSchema.parse(level);
};
