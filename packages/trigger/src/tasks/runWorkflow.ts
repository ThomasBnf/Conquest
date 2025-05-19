import { getFilteredMember } from "@conquest/clickhouse/member/getFilteredMember";
import { MemberWithLevelSchema } from "@conquest/zod/schemas/member.schema";
import { NodeSchema } from "@conquest/zod/schemas/node.schema";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { sleep } from "../helpers/sleep";
import { slackMessage } from "../workflow/slack-message";
import { task } from "../workflow/task";
import { waitFor } from "../workflow/wait";
import { webhook } from "../workflow/webhook";
import { addTags } from "../workflow/add-tags";
import { removeTags } from "../workflow/remove-tags";

export const runWorkflow = schemaTask({
  id: "run-workflow",
  machine: "small-2x",
  schema: z.object({
    workflow: WorkflowSchema,
    member: MemberWithLevelSchema,
  }),
  run: async ({ workflow, member }) => {
    const { nodes, edges } = workflow;

    let node = nodes.find((node) => "isTrigger" in node.data);
    let hasNextNode = true;

    while (hasNextNode) {
      const parsedNode = NodeSchema.parse(node);
      const { type } = parsedNode.data;

      switch (type) {
        case "if-else": {
          const { groupFilters } = parsedNode.data;

          const result = await getFilteredMember({
            member,
            groupFilters,
          });

          logger.info("result", { result, member });

          const trueEdge = edges.find(
            (e) =>
              e.source === parsedNode.id &&
              e.data?.condition === "true" &&
              result === 1,
          );
          const falseEdge = edges.find(
            (e) =>
              e.source === parsedNode.id &&
              e.data?.condition === "false" &&
              result === 0,
          );

          const nextEdge = trueEdge || falseEdge;

          if (nextEdge) {
            node = nodes.find((n) => n.id === nextEdge.target)!;
          } else {
            hasNextNode = false;
          }

          continue;
        }
        case "slack-message": {
          await slackMessage({ node: parsedNode.data, member });
          break;
        }
        case "add-tag": {
          await addTags({ node: parsedNode.data, member });
          break;
        }
        case "remove-tag": {
          await removeTags({ node: parsedNode.data, member });
          break;
        }
        case "task": {
          await sleep(1000);
          await task({ node: parsedNode.data, member });
          break;
        }
        case "wait": {
          await waitFor({ node: parsedNode.data });
          break;
        }
        case "webhook": {
          await webhook({ node: parsedNode.data, member });
          break;
        }
      }

      const edge = edges.find((edge) => edge.source === node?.id);

      if (!edge) {
        hasNextNode = false;
      } else {
        node = nodes.find((currentNode) => edge?.target === currentNode.id);
      }
    }
  },
});
