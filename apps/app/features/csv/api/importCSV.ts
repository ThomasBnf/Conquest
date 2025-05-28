import { protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { csvInfoSchema } from "../schemas/csv-info.schema";

export const importCSV = protectedProcedure
  .input(
    z.object({
      csvInfo: csvInfoSchema,
      mappedColumns: z.record(z.string(), z.string()),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { csvInfo, mappedColumns } = input;
    const { rows, columns } = csvInfo;

    const members = rows.map((row) =>
      Object.fromEntries(
        Object.entries(row)
          .filter(([key]) => mappedColumns[key] !== "undefined")
          .map(([key, value]) => [mappedColumns[key], value]),
      ),
    );

    const companies = members.filter((member) => member.company);

    for (const company of companies) {
    }
  });
