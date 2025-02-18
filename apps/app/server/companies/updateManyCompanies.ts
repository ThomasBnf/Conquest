import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateManyCompanies = protectedProcedure
  .input(
    z.object({
      companies: CompanySchema.array(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { companies } = input;

    for (const company of companies) {
      await prisma.company.update({
        where: {
          id: company.id,
          workspace_id,
        },
        data: company,
      });
    }
  });
