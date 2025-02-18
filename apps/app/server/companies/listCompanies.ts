import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listCompanies = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      cursor: z.string().nullish(),
      take: z.number(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, cursor, take } = input;

    console.log(search);

    const companies = await prisma.company.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
        workspace_id,
      },
      orderBy: {
        name: "asc",
      },
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      take,
    });

    return CompanySchema.array().parse(companies);
  });
