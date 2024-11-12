"use server";

import { runWorkflow } from "@/trigger/runWorkflow.trigger";

type Props = {
  workflow_id: string;
};

export const _runWorkflowTrigger = async ({ workflow_id }: Props) => {
  return await runWorkflow.trigger({ workflow_id });
};
