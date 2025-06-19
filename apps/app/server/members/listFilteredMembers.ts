import { listFilteredMembers as _listFilteredMembers } from "@conquest/db/member/listFilteredMembers";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listFilteredMembers = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
      groupFilters: GroupFiltersSchema,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { cursor, search, id, desc, groupFilters } = input;

    return _listFilteredMembers({
      cursor,
      search,
      id,
      desc,
      groupFilters,
      workspaceId,
    });
  });
