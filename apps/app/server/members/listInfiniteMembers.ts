import { listInfiniteMembers as _listInfiniteMembers } from "@conquest/clickhouse/members/listInfiniteMembers";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listInfiniteMembers = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      search: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { cursor, search } = input;

    return _listInfiniteMembers({ cursor, search, workspace_id });
  });
