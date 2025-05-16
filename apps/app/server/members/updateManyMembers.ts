import { updateManyMembers as _updateManyMembers } from "@conquest/clickhouse/member/updateManyMembers";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateManyMembers = protectedProcedure
  .input(
    z.object({
      members: MemberSchema.array(),
    }),
  )
  .mutation(async ({ input }) => {
    const { members } = input;

    return await _updateManyMembers({ members });
  });
