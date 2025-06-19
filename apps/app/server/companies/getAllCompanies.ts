import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getAllCompanies = protectedProcedure
  .input(
    z.object({
      search: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { search } = input;

    const companies = await prisma.company.findMany({
      where: {
        workspaceId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    return CompanySchema.array().parse(companies);
  });
