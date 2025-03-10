import { updateMember as _updateMember } from "@conquest/clickhouse/members/updateMember";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { protectedProcedure } from "../trpc";

export const updateMember = protectedProcedure
  .input(MemberSchema)
  .mutation(async ({ input }) => {
    return _updateMember(input);
  });
