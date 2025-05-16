import { DuplicateSchema } from "@conquest/zod/schemas/duplicate.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const listAllDuplicates = async ({ workspaceId }: Props) => {
  const duplicates = await prisma.duplicate.findMany({
    where: {
      workspaceId,
    },
  });

  return DuplicateSchema.array().parse(duplicates);
};
