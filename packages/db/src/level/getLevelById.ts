import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { prisma } from "../prisma";

type Props = {
  number: number;
  workspaceId: string;
};

export const getLevel = async ({ number, workspaceId }: Props) => {
  const level = await prisma.level.findUnique({
    where: {
      number,
      workspaceId,
    },
  });

  if (!level) return null;
  return LevelSchema.parse(level);
};
