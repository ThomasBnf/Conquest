import { deleteActivityType as _deleteActivityType } from "@conquest/clickhouse/activity-types/deleteActivityType";
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
    const { workspace_id } = user;
    const { id } = input;

    await client.query({
      query: `
        DELETE FROM activity 
        WHERE activity_type_id = '${id}'
        AND workspace_id = '${workspace_id}'
      `,
    });

    return await _deleteActivityType({ id });
  });
