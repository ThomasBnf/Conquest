import { listInfiniteActivities as _listInfiniteActivities } from "@conquest/clickhouse/activities/listInfiniteActivities";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listInfiniteActivities = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      member_id: z.string().optional(),
      company_id: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { cursor, member_id, company_id } = input;

    return await _listInfiniteActivities({
      cursor,
      member_id,
      company_id,
      workspace_id,
    });
  });
