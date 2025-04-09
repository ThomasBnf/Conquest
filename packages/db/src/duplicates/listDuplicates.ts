import { DuplicateSchema } from "@conquest/zod/schemas/duplicate.schema";
import { prisma } from "../prisma";

type Props = {
  cursor: number | null | undefined;
  workspace_id: string;
};

export const listDuplicates = async ({ cursor, workspace_id }: Props) => {
  console.log(cursor);

  const duplicates = await prisma.duplicate.findMany({
    where: {
      workspace_id,
      state: "PENDING",
    },
    skip: cursor ?? undefined,
    take: cursor ? 25 : undefined,
    orderBy: {
      created_at: "desc",
      id: "asc",
    },
  });

  return DuplicateSchema.array().parse(duplicates);
};
