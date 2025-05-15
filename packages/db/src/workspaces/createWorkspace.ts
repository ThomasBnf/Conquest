import {
  type Workspace,
  WorkspaceSchema,
} from "@conquest/zod/schemas/workspace.schema";
import { addDays } from "date-fns";
import { prisma } from "../prisma";

type Props = {
  name: string;
  slug: string;
} & Omit<Partial<Workspace>, "trialEnd">;

export const createWorkspace = async (props: Props) => {
  const workspace = await prisma.workspace.create({
    data: {
      ...props,
      plan: "ACTIVE",
      trialEnd: addDays(new Date(), 7),
    },
  });

  return WorkspaceSchema.parse(workspace);
};
