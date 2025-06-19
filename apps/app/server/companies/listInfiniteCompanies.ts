import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listInfiniteCompanies = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      search: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { cursor, search } = input;

    const companies = await prisma.company.findMany({
      where: {
        workspaceId,
        name: { contains: search, mode: "insensitive" },
      },
      orderBy: {
        name: "asc",
      },
      skip: cursor ?? undefined,
      take: 25,
    });

    return CompanySchema.array().parse(companies);
  });
