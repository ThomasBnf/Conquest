import { updateMember as _updateMember } from "@conquest/clickhouse/members/updateMember";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateMember = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: MemberSchema.partial(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id, data } = input;

    return _updateMember({ id, data });
  });
