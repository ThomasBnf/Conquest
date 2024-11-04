import { prisma } from "@/lib/prisma";
import { inngest } from "./client";

export const listMembersInngest = inngest.createFunction(
  { id: "list-members" },
  { event: "workflow/list-members" },
  async ({ event, step }) => {
    const { workflow } = event.data;

    return await step.run("list-members", async () => {
      return await prisma.member.findMany({
        where: {
          workspace_id: workflow.workspace_id,
        },
      });
    });
  },
);
