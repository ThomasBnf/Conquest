import { DuplicateSchema } from "@conquest/zod/schemas/duplicate.schema";
import { prisma } from "../prisma";

type Props = {
  cursor: number | null | undefined;
  workspaceId: string;
};

export const listDuplicates = async ({ cursor, workspaceId }: Props) => {
  const pageSize = 10;
  const skip = cursor ? cursor : 0;

  const duplicates = await prisma.duplicate.findMany({
    where: {
      workspaceId,
      state: "PENDING",
    },
    skip,
    take: pageSize,
    orderBy: {
      totalPulse: "desc",
    },
  });

  return DuplicateSchema.array().parse(duplicates);
};
