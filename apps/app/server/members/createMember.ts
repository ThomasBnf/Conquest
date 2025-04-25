import { MemberFormSchema } from "@/features/members/schema/member-form.schema";
import { createMember as _createMember } from "@conquest/clickhouse/members/createMember";
import { checkDuplicates } from "@conquest/trigger/tasks/checkDuplicates";
import { protectedProcedure } from "../trpc";

export const createMember = protectedProcedure
  .input(MemberFormSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    const member = await _createMember({ ...input, workspaceId });

    checkDuplicates.trigger({ workspaceId });

    return member;
  });
