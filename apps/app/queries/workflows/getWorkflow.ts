import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { prisma } from "lib/prisma";

type Props = {
  id: string;
  workspace_id: string;
};

export const getWorkflow = async ({ id, workspace_id }: Props) => {
  const workflow = await prisma.workflows.findUnique({
    where: {
      id,
      workspace_id,
    },
  });

  return WorkflowSchema.parse(workflow);
};
