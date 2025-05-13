import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { z } from "zod";

export const createTask = protectedProcedure
  .input(
    z.object({
      title: z.string(),
      dueDate: z.date().optional(),
      assignee: z.string().uuid(),
      memberId: z.string().uuid().optional(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    return await client.insert({
      table: "taks",
      values: [
        {
          ...input,
          workspaceId,
        },
      ],
      format: "JSON",
    });
  });
