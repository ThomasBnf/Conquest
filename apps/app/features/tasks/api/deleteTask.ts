import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { z } from "zod";

export const deleteTask = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    await client.query({
      query: `
        ALTER TABLE task
        DELETE WHERE id = '${id}'
      `,
    });
  });
