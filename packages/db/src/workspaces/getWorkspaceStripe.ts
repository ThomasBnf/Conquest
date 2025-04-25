import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { prisma } from "../prisma";

type Props = {
  stripeCustomerId: string;
};

export const getWorkspaceStripe = async ({ stripeCustomerId }: Props) => {
  const workspace = await prisma.workspace.findFirst({
    where: {
      stripeCustomerId,
    },
  });

  if (!workspace) return null;
  return WorkspaceSchema.parse(workspace);
};
