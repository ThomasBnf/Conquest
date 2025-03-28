import { listPaginatedMembers as _listPaginatedMembers } from "@conquest/clickhouse/members/listPaginatedMembers";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listPaginatedMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      cursor: z.string().nullish(),
      take: z.number(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, cursor, take } = input;

    return _listPaginatedMembers({ search, cursor, take, workspace_id });
  });
