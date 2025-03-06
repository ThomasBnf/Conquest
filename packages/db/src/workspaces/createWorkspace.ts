import {
  type Workspace,
  WorkspaceSchema,
} from "@conquest/zod/schemas/workspace.schema";
import { prisma } from "../prisma";

type Props = {
  name: string;
  slug: string;
} & Partial<Workspace>;

export const createWorkspace = async (props: Props) => {
  const workspace = await prisma.workspace.create({
    data: {
      ...props,
      plan: "BASIC",
    },
  });

  return WorkspaceSchema.parse(workspace);
};
