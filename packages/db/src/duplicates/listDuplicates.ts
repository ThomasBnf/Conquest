import { DuplicateSchema } from "@conquest/zod/schemas/duplicate.schema";
import { prisma } from "../prisma";

type Props = {
  cursor: number | null | undefined;
  workspace_id: string;
};

export const listDuplicates = async ({ cursor, workspace_id }: Props) => {
  const pageSize = 10;
  const skip = cursor ? cursor : 0;

  const duplicates = await prisma.duplicate.findMany({
    where: {
      workspace_id,
      state: "PENDING",
    },
    skip,
    take: pageSize,
    orderBy: {
      created_at: "desc",
    },
  });

  return DuplicateSchema.array().parse(duplicates);
};
