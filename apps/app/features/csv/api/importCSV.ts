import { protectedProcedure } from "@/server/trpc";
import { csvInfoSchema } from "@conquest/trigger/csv/schemas/csv-info.schema";
import { importMembers } from "@conquest/trigger/tasks/import-members";
import { z } from "zod";

export const importCSV = protectedProcedure
  .input(
    z.object({
      csvInfo: csvInfoSchema,
      mappedColumns: z.record(z.string(), z.string()),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { csvInfo, mappedColumns } = input;

    await importMembers.trigger({
      csvInfo,
      mappedColumns,
      workspaceId,
    });
  });
