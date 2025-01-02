import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { prisma } from "lib/prisma";

type Props = {
  workspace_id: string;
};

export const listWorkflows = async ({ workspace_id }: Props) => {
  const workflows = await prisma.workflows.findMany({
    where: {
      workspace_id,
    },
  });

  return WorkflowSchema.array().parse(workflows);
};
