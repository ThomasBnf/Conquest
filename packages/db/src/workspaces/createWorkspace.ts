import {
  type Workspace,
  WorkspaceSchema,
} from "@conquest/zod/schemas/workspace.schema";
import { addDays } from "date-fns";
import { prisma } from "../prisma";

type Props = {
  name: string;
  slug: string;
} & Omit<Partial<Workspace>, "trial_end">;

export const createWorkspace = async (props: Props) => {
  const workspace = await prisma.workspace.create({
    data: {
      ...props,
      plan: "ACTIVE",
      trial_end: addDays(new Date(), 14),
    },
  });

  return WorkspaceSchema.parse(workspace);
};
