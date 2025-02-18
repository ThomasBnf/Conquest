import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createCompany = protectedProcedure
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { name } = input;

    const company = await prisma.company.create({
      data: {
        name,
        source: "MANUAL",
        workspace_id,
      },
    });

    return CompanySchema.parse(company);
  });
