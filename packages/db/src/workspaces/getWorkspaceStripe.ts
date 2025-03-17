import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { prisma } from "../prisma";

type Props = {
  stripe_customer_id: string;
};

export const getWorkspaceStripe = async ({ stripe_customer_id }: Props) => {
  const workspace = await prisma.workspace.findFirst({
    where: {
      stripe_customer_id,
    },
  });

  if (!workspace) return null;
  return WorkspaceSchema.parse(workspace);
};
