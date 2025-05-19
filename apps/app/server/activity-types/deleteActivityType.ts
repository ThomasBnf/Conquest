import { deleteActivityType as _deleteActivityType } from "@conquest/clickhouse/activity-type/deleteActivityType";
import { client } from "@conquest/clickhouse/client";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteActivityType = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { id } = input;

    await client.query({
      query: `
        ALTER TABLE activity 
        DELETE WHERE activityTypeId = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
    });

    await _deleteActivityType({ id });
  });
