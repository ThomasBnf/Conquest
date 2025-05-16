import { listInfiniteActivities as _listInfiniteActivities } from "@conquest/clickhouse/activity/listInfiniteActivities";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listInfiniteActivities = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      memberId: z.string().optional(),
      companyId: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { cursor, memberId, companyId } = input;

    return await _listInfiniteActivities({
      cursor,
      memberId,
      companyId,
      workspaceId,
    });
  });
