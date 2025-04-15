import { DuplicateSchema } from "@conquest/zod/schemas/duplicate.schema";
import { prisma } from "../prisma";

type Props = {
  workspace_id: string;
};

export const listAllDuplicates = async ({ workspace_id }: Props) => {
  const duplicates = await prisma.duplicate.findMany({
    where: {
      workspace_id,
      state: "PENDING",
    },
  });

  return DuplicateSchema.array().parse(duplicates);
};
