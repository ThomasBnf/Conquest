"use server";

import { inngest } from "@/inngest/client";

type Props = {
  workflow_id: string;
};

export const _runWorkflowInngest = async ({ workflow_id }: Props) => {
  return await inngest.send({
    name: "workflow/run",
    data: { workflow_id },
  });
};
