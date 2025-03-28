import { listFilteredMembers as _listFilteredMembers } from "@conquest/clickhouse/members/listFilteredMembers";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listFilteredMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
      page: z.number(),
      pageSize: z.number(),
      groupFilters: GroupFiltersSchema,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, id, desc, page, pageSize, groupFilters } = input;

    return _listFilteredMembers({
      search,
      id,
      desc,
      page,
      pageSize,
      groupFilters,
      workspace_id,
    });
  });
