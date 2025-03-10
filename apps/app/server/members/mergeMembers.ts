import { mergeMembers as _mergeMembers } from "@conquest/clickhouse/members/mergeMembers";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const mergeMembers = protectedProcedure
  .input(
    z.object({
      leftMember: MemberSchema,
      rightMember: MemberSchema,
    }),
  )
  .mutation(async ({ input }) => {
    const { leftMember, rightMember } = input;

    return await _mergeMembers({ leftMember, rightMember });
  });
