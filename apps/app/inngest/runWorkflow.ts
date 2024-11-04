import { prisma } from "@/lib/prisma";
import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import { NodeSchema, type NodeTagMember } from "@conquest/zod/node.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { z } from "zod";
import { inngest } from "./client";

let members: MemberWithActivities[] = [];

export const runWorkflowInngest = inngest.createFunction(
  { id: "run-workflow" },
  { event: "workflow/run" },
  async ({ event, step }) => {
    const { workflow } = event.data;
    const parsedWorkflow = WorkflowSchema.parse(workflow);

    await step.run("run-workflow", async () => {
      const { nodes, edges, workspace_id } = parsedWorkflow;
      const triggerNode = nodes.find((node) => "isTrigger" in node.data);
      const firstEdge = edges.find((edge) => edge.source === triggerNode?.id);

      let hasNextNode = true;

      do {
        const node = nodes.find((node) => firstEdge?.target === node.id);
        const parsedNode = NodeSchema.parse(node);
        const { type } = parsedNode.data;

        switch (type) {
          case "list-members": {
            members = z
              .array(MemberWithActivitiesSchema)
              .parse(await listMembers(workspace_id));
            break;
          }
        }

        console.log(members);

        hasNextNode = false;
      } while (hasNextNode);

      return parsedWorkflow;
    });
  },
);

export const listMembers = async (workspace_id: string) => {
  return await prisma.member.findMany({
    where: { workspace_id },
  });
};

export const addTag = async (node: NodeTagMember) => {
  const { tags } = node;

  if (tags.length === 0) return;

  for (const member of members ?? []) {
    const memberTags = member.tags;
    const hasTags = tags.some((tag) => memberTags.includes(tag));

    if (!hasTags) {
      await prisma.member.update({
        where: { id: member.id },
        data: { tags: { push: tags } },
      });
    }
  }
};
