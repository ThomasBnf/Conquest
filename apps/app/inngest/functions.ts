import { runWorkflow } from "@/features/workflows/functions/runWorkflow";
import { prisma } from "@/lib/prisma";
import { NodeRecurringSchema } from "@conquest/zod/node.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { inngest } from "./client";

export const listWorkflows = inngest.createFunction(
  { id: "list-workflows" },
  { cron: "TZ=Europe/Paris * * * * *" },
  async ({ event, step }) => {
    const workflows = await step.run("list-workflows", async () => {
      const publishedWorkflows = await prisma.workflow.findMany({
        where: {
          published: true,
        },
      });

      const parsedWorkflows = WorkflowSchema.array().parse(publishedWorkflows);

      return parsedWorkflows.filter((workflow) =>
        workflow.nodes.some((node) => "isTrigger" in node.data),
      );
    });

    for (const workflow of workflows) {
      const trigger = workflow.nodes.find((node) => "isTrigger" in node.data);

      const { frequency, time } = NodeRecurringSchema.parse(trigger?.data);

      await step.run(`run-workflow-${workflow.id}`, async () => {
        await runWorkflow({
          id: workflow.id,
        });
      });
    }

    return { event, body: workflows };
  },
);
