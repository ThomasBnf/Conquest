import { getFilteredMember } from "@conquest/clickhouse/member/getFilteredMember";
import { createRun } from "@conquest/db/runs/createRun";
import { updateRun } from "@conquest/db/runs/updateRun";
import { getUserById } from "@conquest/db/users/getUserById";
import { getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { resend } from "@conquest/resend";
import WorkflowFailed from "@conquest/resend/emails/workflow-failed";
import WorkflowRun from "@conquest/resend/emails/workflow-run";
import { Edge } from "@conquest/zod/schemas/edge.schema";
import {
  MemberWithLevel,
  MemberWithLevelSchema,
} from "@conquest/zod/schemas/member.schema";
import {
  Node,
  NodeIfElseSchema,
  NodeSchema,
  NodeTriggerSchema,
} from "@conquest/zod/schemas/node.schema";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { sleep } from "../helpers/sleep";
import { addTags } from "../workflow/add-tags";
import { removeTags } from "../workflow/remove-tags";
import { slackMessage } from "../workflow/slack-message";
import { task } from "../workflow/task";
import { waitFor } from "../workflow/wait";
import { webhook } from "../workflow/webhook";

export const runWorkflow = schemaTask({
  id: "run-workflow",
  machine: "small-2x",
  schema: z.object({
    workflow: WorkflowSchema,
    member: MemberWithLevelSchema,
  }),
  run: async ({ workflow, member }) => {
    const { nodes, edges, createdBy, workspaceId } = workflow;
    const { slug } = await getWorkspace({ id: workspaceId });

    const run = await createRun({ workflowId: workflow.id });

    const runNodes = new Map(nodes.map((node) => [node.id, node]));

    let node = nodes.find((node) => "isTrigger" in node.data);
    let hasNextNode = true;

    while (hasNextNode) {
      const parsedNode = NodeSchema.parse(node);
      const { type } = parsedNode.data;
      const isTrigger = "isTrigger" in parsedNode.data;

      if (isTrigger) {
        const { alertByEmail } = NodeTriggerSchema.parse(parsedNode.data);

        runNodes.set(parsedNode.id, {
          ...parsedNode,
          data: { ...parsedNode.data, status: "COMPLETED" },
        });

        if (alertByEmail) {
          const user = await getUserById({ id: createdBy });

          if (!user) return;

          await resend.emails.send({
            from: "Conquest <team@useconquest.com>",
            to: user.email,
            subject: `Workflow "${workflow.name}" has run`,
            react: WorkflowRun({
              slug,
              workflowId: workflow.id,
              workflowName: workflow.name,
              runId: run.id,
            }),
          });
        }
      }

      switch (type) {
        case "if-else": {
          const nextNode = await IfElse({
            node: parsedNode,
            member,
            edges,
            nodes,
          });

          runNodes.set(parsedNode.id, {
            ...parsedNode,
            data: {
              ...parsedNode.data,
              status: "COMPLETED",
            },
          });

          if (nextNode) {
            node = nextNode;
            continue;
          }

          hasNextNode = false;
          break;
        }
        case "slack-message": {
          const result = await slackMessage({ node: parsedNode, member });
          runNodes.set(parsedNode.id, result);
          break;
        }
        case "add-tag": {
          const result = await addTags({ node: parsedNode, member });
          runNodes.set(parsedNode.id, result);
          break;
        }
        case "remove-tag": {
          const result = await removeTags({ node: parsedNode, member });
          runNodes.set(parsedNode.id, result);
          break;
        }
        case "task": {
          await sleep(1000);
          const result = await task({ node: parsedNode, member, slug });
          runNodes.set(parsedNode.id, result);
          break;
        }
        case "wait": {
          const result = await waitFor({ node: parsedNode });
          runNodes.set(parsedNode.id, result);
          break;
        }
        case "webhook": {
          const result = await webhook({ node: parsedNode, member });
          runNodes.set(parsedNode.id, result);
          break;
        }
      }

      const edge = edges.find((edge) => edge.source === node?.id);

      if (!edge) {
        hasNextNode = false;
      } else {
        node = nodes.find((currentNode) => edge?.target === currentNode.id);
      }

      const hasFailed = Array.from(runNodes.values()).some(
        (node) => node.data.status === "FAILED",
      );

      if (hasFailed) {
        updateRun({ id: run.id, status: "FAILED", runNodes });

        const user = await getUserById({ id: workflow.createdBy });

        if (!user) return;

        return await resend.emails.send({
          from: "Conquest <team@useconquest.com>",
          to: user.email,
          subject: `Workflow "${workflow.name}" has failed to run`,
          react: WorkflowFailed({
            slug,
            workflowId: workflow.id,
            workflowName: workflow.name,
            runId: run.id,
          }),
        });
      }
    }

    return updateRun({ id: run.id, status: "COMPLETED", runNodes });
  },
});

const IfElse = async ({
  node,
  member,
  edges,
  nodes,
}: {
  node: Node;
  member: MemberWithLevel;
  edges: Edge[];
  nodes: Node[];
}) => {
  const parsedNode = NodeIfElseSchema.parse(node.data);
  const { groupFilters } = parsedNode;

  const result = await getFilteredMember({
    member,
    groupFilters,
  });

  const condition = Boolean(result);

  const nextEdge = edges.find(
    (edge) =>
      edge.source === node.id &&
      edge.data?.condition === (condition ? "true" : "false"),
  );

  if (nextEdge) {
    const nextNode = nodes.find((n) => n.id === nextEdge.target);
    logger.info("nextNode", { nextNode });

    return nextNode;
  }

  return null;
};
