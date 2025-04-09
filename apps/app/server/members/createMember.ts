import { MemberFormSchema } from "@/features/members/schema/member-form.schema";
import { createMember as _createMember } from "@conquest/clickhouse/members/createMember";
import { checkDuplicates } from "@conquest/trigger/tasks/checkDuplicates";
import { protectedProcedure } from "../trpc";

export const createMember = protectedProcedure
  .input(MemberFormSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

    const member = await _createMember({ ...input, workspace_id });

    checkDuplicates.trigger({ workspace_id });

    return member;
  });
