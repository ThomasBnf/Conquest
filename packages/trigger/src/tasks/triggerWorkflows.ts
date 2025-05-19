import { prisma } from "@conquest/db/prisma";
import { MemberWithLevelSchema } from "@conquest/zod/schemas/member.schema";
import { TriggerSchema } from "@conquest/zod/schemas/node.schema";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { runWorkflow } from "./runWorkflow";

export const triggerWorkflows = schemaTask({
  id: "trigger-workflows",
  machine: "small-2x",
  schema: z.object({
    trigger: TriggerSchema,
    member: MemberWithLevelSchema,
  }),
  run: async ({ trigger, member }) => {
    const { workspaceId } = member;

    const workflows = WorkflowSchema.array().parse(
      await prisma.workflow.findMany({
        where: {
          trigger,
          published: true,
          workspaceId,
        },
      }),
    );

    logger.info("workflows", { workflows });

    for (const workflow of workflows) {
      await runWorkflow.trigger({ workflow, member });
    }
  },
});
