import { mergeMembers as _mergeMembers } from "@conquest/clickhouse/members/mergeMembers";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const mergeMembers = protectedProcedure
  .input(
    z.object({
      members: MemberSchema.array(),
      finalMember: MemberSchema,
    }),
  )
  .mutation(async ({ input }) => {
    const { members, finalMember } = input;

    return await _mergeMembers({ members, finalMember });
  });
