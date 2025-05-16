import { mergeMembers as _mergeMembers } from "@conquest/clickhouse/member/mergeMembers";
import { DuplicateSchema } from "@conquest/zod/schemas/duplicate.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const mergeMembers = protectedProcedure
  .input(
    z.object({
      duplicate: DuplicateSchema.optional(),
      members: MemberSchema.array().optional(),
      finalMember: MemberSchema.nullable(),
    }),
  )
  .mutation(async ({ input }) => {
    const { duplicate, members, finalMember } = input;

    return await _mergeMembers({ duplicate, members, finalMember });
  });
