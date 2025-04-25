import {
  type Workspace,
  WorkspaceSchema,
} from "@conquest/zod/schemas/workspace.schema";
import { addDays } from "date-fns";
import { prisma } from "../prisma";

type Props = {
  id: string;
} & Omit<Partial<Workspace>, "trialEnd">;

export const updateWorkspace = async ({ id, ...data }: Props) => {
  const workspace = await prisma.workspace.update({
    where: {
      id,
    },
    data: {
      ...data,
      trialEnd: addDays(new Date(), 14),
    },
  });

  return WorkspaceSchema.parse(workspace);
};
