"use server";

import { CustomError } from "@/lib/safeAction";
import { runWorkflow } from "@/trigger/runWorkflow.trigger";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { MemberSchema } from "@conquest/zod/member.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const _createMember = authAction
  .metadata({ name: "createMember" })
  .schema(
    z.object({
      first_name: z.string(),
      last_name: z.string(),
      email: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { first_name, last_name, email } }) => {
    const workspace_id = ctx.user.workspace_id;

    const existingMember = await prisma.members.findFirst({
      where: {
        emails: { has: email },
        workspace_id,
      },
    });

    if (existingMember) {
      throw new CustomError("Member already exists with this email", 400);
    }

    const member = await prisma.members.create({
      data: {
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        emails: [email],
        source: "MANUAL",
        workspace_id: ctx.user.workspace_id,
      },
    });

    if (member) {
      const workflows = z.array(WorkflowSchema).parse(
        await prisma.workflows.findMany({
          where: {
            published: true,
            workspace_id,
          },
        }),
      );

      const filteredWorkflows = workflows.filter((workflow) =>
        workflow.nodes.some((node) => node.data.type === "member-created"),
      );

      for (const workflow of filteredWorkflows) {
        await runWorkflow.trigger({
          workflow_id: workflow.id,
          created_member: MemberWithActivitiesSchema.parse(member),
        });
      }
    }

    revalidatePath(`/${ctx.user.workspace.slug}/members`);
    return MemberSchema.parse(member);
  });
