import type { LEVEL } from "@conquest/zod/schemas/level.schema";
import { prisma } from "../prisma";

type Props = {
  levels: LEVEL[];
  workspaceId: string;
};

export const createManyLevels = async ({ levels, workspaceId }: Props) => {
  const values = levels.map((level) => ({
    ...level,
    workspaceId,
  }));

  await prisma.level.createMany({
    data: values,
  });
};
