import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
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
    member: MemberSchema,
  }),
  run: async ({ trigger, member }) => {
    const { workspaceId } = member;

    logger.info("trigger", { trigger });
    logger.info("member", { member });

    const workflows = WorkflowSchema.array().parse(
      await prisma.workflow.findMany({
        where: {
          published: true,
          archivedAt: null,
          workspaceId,
        },
      }),
    );

    const filteredWorkflows = workflows.filter((workflow) =>
      workflow.nodes.some((node) => node.data.type === trigger),
    );

    logger.info("workflows", { filteredWorkflows });

    for (const workflow of filteredWorkflows) {
      await runWorkflow.trigger({ workflow, member });
    }
  },
});
