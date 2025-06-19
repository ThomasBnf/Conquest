import type { Level } from "@conquest/zod/schemas/level.schema";
import { prisma } from "../prisma";

type Props = {
  number: number;
  workspaceId: string;
} & Partial<Level>;

export const updateLevel = async ({ number, workspaceId, ...data }: Props) => {
  await prisma.level.update({
    where: {
      number,
      workspaceId,
    },
    data: {
      ...data,
    },
  });
};
