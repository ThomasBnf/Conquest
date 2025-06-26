import { MemberFormSchema } from "@/features/members/schema/member-form.schema";
import { createMember as _createMember } from "@conquest/db/member/createMember";
import { checkDuplicates } from "@conquest/trigger/tasks/checkDuplicates";
import { triggerWorkflows } from "@conquest/trigger/tasks/triggerWorkflows";
import { protectedProcedure } from "../trpc";

export const createMember = protectedProcedure
  .input(MemberFormSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    const member = await _createMember({ ...input, workspaceId });

    checkDuplicates.trigger({ workspaceId });

    await triggerWorkflows.trigger({
      trigger: "member-created",
      member,
    });

    return member;
  });
