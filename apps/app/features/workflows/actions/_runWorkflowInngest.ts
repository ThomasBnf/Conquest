"use server";

import { inngest } from "@/inngest/client";
import type { Workflow } from "@conquest/zod/workflow.schema";

type Props = {
  workflow: Workflow;
};

export const _runWorkflowInngest = async ({ workflow }: Props) => {
  await inngest.send({
    name: "workflow/run",
    data: { workflow },
  });
};
