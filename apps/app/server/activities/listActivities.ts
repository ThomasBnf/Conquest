import { listActivities as _listActivities } from "@conquest/clickhouse/activities/listActivities";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listActivities = protectedProcedure
  .input(
    z.object({
      cursor: z.string().optional(),
      take: z.number().optional(),
      member_id: z.string().optional(),
      company_id: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { cursor, take, member_id, company_id } = input;

    return await _listActivities({
      cursor,
      take,
      member_id,
      company_id,
      workspace_id,
    });
  });
