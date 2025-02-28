import { updateMember } from "@conquest/clickhouse/members/updateMember";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateManyMembers = protectedProcedure
  .input(
    z.object({
      members: MemberSchema.partial().array(),
    }),
  )
  .mutation(async ({ input }) => {
    const { members } = input;

    for (const member of members) {
      if (!member.id) return;
      const { id, workspace_id, created_at, updated_at, ...data } = member;
      await updateMember({ id, data });
    }
  });
