import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { addDays } from "date-fns";
import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const updateTrial = async ({ id, ...data }: Props) => {
  const workspace = await prisma.workspace.update({
    where: {
      id,
    },
    data: {
      ...data,
      trialEnd: addDays(new Date(), 7),
    },
  });

  return WorkspaceSchema.parse(workspace);
};
