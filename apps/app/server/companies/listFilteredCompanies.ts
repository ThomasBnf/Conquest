import { orderByParser } from "@conquest/db/helpers/orderByParser";
import { Prisma, prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listFilteredCompanies = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { cursor, search, id, desc } = input;

    const orderBy = orderByParser({
      id,
      desc,
      type: "companies",
    }) as Prisma.CompanyOrderByWithRelationInput[];

    const companies = await prisma.company.findMany({
      where: {
        workspaceId,
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      },
      take: 50,
      skip: cursor ? cursor : 0,
      orderBy,
    });

    return CompanySchema.array().parse(companies);
  });
