"use server";

import { authAction } from "@/lib/authAction";
import { runWorkflowTrigger } from "@conquest/trigger/tasks/runWorkflow.trigger";
import { z } from "zod";

export const runWorkflow = authAction
  .metadata({
    name: "runWorkflow",
  })
  .schema(
    z.object({
      workflow_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { workflow_id } }) => {
    return await runWorkflowTrigger.trigger({ workflow_id });
  });
