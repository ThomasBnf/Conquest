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
        ALTER TABLE activity 
        DELETE WHERE activity_type_id = '${id}'
        AND workspace_id = '${workspace_id}'
      `,
    });

    await _deleteActivityType({ id });
  });
