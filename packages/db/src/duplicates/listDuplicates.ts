import { DuplicateSchema } from "@conquest/zod/schemas/duplicate.schema";
import { prisma } from "../prisma";

type Props = {
  cursor: number;
  workspace_id: string;
};

export const listDuplicates = async ({ cursor, workspace_id }: Props) => {
  const duplicates = await prisma.duplicate.findMany({
    where: {
      workspace_id,
      state: "PENDING",
    },
    skip: cursor,
    take: 25,
  });

  return DuplicateSchema.array().parse(duplicates);
};
