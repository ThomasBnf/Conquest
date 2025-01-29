import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { prisma } from "../../prisma";

type Props = {
  id: string;
};

export const getWorkspace = async ({ id }: Props) => {
  const workspace = await prisma.workspaces.findUnique({
    where: {
      id,
    },
  });

  return WorkspaceSchema.parse(workspace);
};
