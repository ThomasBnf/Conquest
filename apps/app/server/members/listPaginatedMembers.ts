import { listPaginatedMembers as _listPaginatedMembers } from "@conquest/clickhouse/members/listPaginatedMembers";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listPaginatedMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      cursor: z.number().nullish(),
      limit: z.number().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, limit, cursor } = input;

    return _listPaginatedMembers({ search, workspace_id, limit, cursor });
  });
