import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { z } from "zod";

export const deleteTask = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    return await client.query({
      query: `
      ALTER TABLE task
      DELETE WHERE id = '${id}'
    `,
    });
  });
