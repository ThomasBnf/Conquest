import { listInfiniteMembers as _listInfiniteMembers } from "@conquest/db/member/listInfiniteMembers";
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
    const { workspaceId } = user;
    const { cursor, search } = input;

    return _listInfiniteMembers({ cursor, search, workspaceId });
  });
