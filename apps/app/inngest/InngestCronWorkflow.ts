import { prisma } from "@/lib/prisma";
import {
  NodeRecurringSchema,
  NodeSchema,
  type RepeatOn,
} from "@conquest/zod/node.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { format } from "date-fns";
import { z } from "zod";
import { inngest } from "./client";

export const InngestCronWorkflow = inngest.createFunction(
  { id: "cron-workflow" },
  { cron: "*/15 * * * *" },
  async ({ step }) => {
    const workflows = await step.run("fetch-workflows", async () => {
      return z.array(WorkflowSchema).parse(
        await prisma.workflow.findMany({
          where: {
            published: true,
          },
        }),
      );
    });

    const recurringWorkflows = workflows.filter((workflow) =>
      workflow.nodes.find(
        (node) => NodeSchema.parse(node).data.type === "recurring-schedule",
      ),
    );

    const today = new Date();

    await step.run("process-workflows", async () => {
      for (const workflow of recurringWorkflows) {
        const { id } = workflow;

        const nodeTrigger = workflow.nodes.find(
          (node) => NodeSchema.parse(node).data.type === "recurring-schedule",
        );

        if (!nodeTrigger) continue;

        const parsedNodeTrigger = NodeRecurringSchema.parse(nodeTrigger.data);
        const { frequency, repeat_on, time } = parsedNodeTrigger;

        const currentTime = format(today, "HH:mm");
        const isTimeToRun = time === currentTime;

        if (frequency === "daily" && isTimeToRun) {
          await inngest.send({
            name: "workflow/run",
            data: { workflow_id: id },
          });
          continue;
        }

        const currentDay = format(today, "eeee").toLowerCase() as RepeatOn;
        const shouldRunToday = repeat_on.includes(currentDay);

        if (shouldRunToday && isTimeToRun) {
          await inngest.send({
            name: "workflow/run",
            data: { workflow_id: id },
          });
        }
      }
    });
  },
);
