import { countMembers as _countMembers } from "@conquest/clickhouse/members/countMembers";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const countMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      groupFilters: GroupFiltersSchema,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { search, groupFilters } = input;

    return _countMembers({ search, groupFilters, workspaceId });
  });
