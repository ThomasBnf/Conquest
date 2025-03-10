import { MemberFormSchema } from "@/features/members/schema/member-form.schema";
import { createMember as _createMember } from "@conquest/clickhouse/members/createMember";
import { protectedProcedure } from "../trpc";

export const createMember = protectedProcedure
  .input(MemberFormSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

    return _createMember({ ...input, workspace_id });
  });
