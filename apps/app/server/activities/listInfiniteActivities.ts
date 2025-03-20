import { listActivities as _listActivities } from "@conquest/clickhouse/activities/listActivities";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listInfiniteActivities = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      limit: z.number(),
      member_id: z.string().optional(),
      company_id: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { cursor, limit, member_id, company_id } = input;

    return await _listActivities({
      cursor,
      limit,
      member_id,
      company_id,
      workspace_id,
    });
  });
