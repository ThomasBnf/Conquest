import { listMembersProfiles as _listMembersProfiles } from "@conquest/clickhouse/profile/listMembersProfiles";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listMembersProfiles = protectedProcedure
  .input(
    z.object({
      members: MemberSchema.array(),
    }),
  )
  .query(async ({ input }) => {
    const { members } = input;

    return await _listMembersProfiles({ members });
  });
