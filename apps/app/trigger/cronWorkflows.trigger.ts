import { prisma } from "@/lib/prisma";
import {
  NodeRecurringSchema,
  NodeSchema,
  type RepeatOn,
} from "@conquest/zod/node.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { schedules } from "@trigger.dev/sdk/v3";
import { format } from "date-fns";
import { z } from "zod";
import { runWorkflow } from "./runWorkflow.trigger";

export const cronWorkflows = schedules.task({
  id: "cron-workflows",
  cron: "*/15 * * * *",
  run: async (_, { ctx }) => {
    if (ctx.environment.type !== "PRODUCTION") return;

    const workflows = z.array(WorkflowSchema).parse(
      await prisma.workflow.findMany({
        where: {
          published: true,
        },
      }),
    );

    const recurringWorkflows = workflows.filter((workflow) =>
      workflow.nodes.find(
        (node) => NodeSchema.parse(node).data.type === "recurring-workflow",
      ),
    );

    const today = new Date();

    for (const workflow of recurringWorkflows) {
      const { id } = workflow;

      const nodeTrigger = workflow.nodes.find(
        (node) => NodeSchema.parse(node).data.type === "recurring-workflow",
      );

      if (!nodeTrigger) continue;

      const parsedNodeTrigger = NodeRecurringSchema.parse(nodeTrigger.data);
      const { frequency, repeat_on, time } = parsedNodeTrigger;

      const currentTime = format(today, "HH:mm");
      const isTimeToRun = time === currentTime;

      if (frequency === "daily" && isTimeToRun) {
        await runWorkflow.trigger({ workflow_id: id });
        continue;
      }

      const currentDay = format(today, "eeee").toLowerCase() as RepeatOn;
      const shouldRunToday = repeat_on.includes(currentDay);

      if (shouldRunToday && isTimeToRun) {
        await runWorkflow.trigger({ workflow_id: id });
      }
    }
  },
});
