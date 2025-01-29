"use server";

import { MemberFormSchema } from "@/features/members/schema/member-form.schema";
import { CustomError } from "@/lib/safeAction";
import { prisma } from "@conquest/db/prisma";
import { runWorkflowTrigger } from "@conquest/trigger/tasks/runWorkflow.trigger";
import { MemberWithActivitiesSchema } from "@conquest/zod/schemas/activity.schema";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { authAction } from "lib/authAction";
import { redirect } from "next/navigation";
import { z } from "zod";

export const createMember = authAction
  .metadata({ name: "createMember" })
  .schema(MemberFormSchema)
  .action(
    async ({
      ctx: { user },
      parsedInput: { first_name, last_name, email },
    }) => {
      const { workspace } = user;
      const { id, slug } = workspace;

      const existingMember = await prisma.members.findFirst({
        where: {
          primary_email: email,
          workspace_id: id,
        },
      });

      if (existingMember) {
        throw new CustomError("Member already exists with this email", 400);
      }

      const member = await prisma.members.create({
        data: {
          first_name,
          last_name,
          primary_email: email,
          source: "MANUAL",
          workspace_id: id,
        },
      });

      if (member) {
        const workflows = z.array(WorkflowSchema).parse(
          await prisma.workflows.findMany({
            where: {
              published: true,
              workspace_id: id,
            },
          }),
        );

        const filteredWorkflows = workflows.filter((workflow) =>
          workflow.nodes.some((node) => node.data.type === "member-created"),
        );

        for (const workflow of filteredWorkflows) {
          await runWorkflowTrigger.trigger({
            workflow_id: workflow.id,
            created_member: MemberWithActivitiesSchema.parse(member),
          });
        }
      }

      redirect(`/${slug}/members/${member.id}`);
    },
  );
