"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { CompanySchema } from "@conquest/zod/company.schema";
import { z } from "zod";

export const _listCompanies = authAction
  .metadata({ name: "_listCompanies" })
  .schema(
    z.object({
      name: z.string(),
      page: z.number(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { name, page, id, desc } }) => {
    const workspace_id = user.workspace_id;

    const companies = await prisma.company.findMany({
      where: {
        name: name ? { contains: name, mode: "insensitive" } : undefined,
        workspace_id,
      },
      orderBy: {
        [id]: desc ? "desc" : "asc",
      },
      take: 50,
      skip: (page - 1) * 50,
    });

    return CompanySchema.array().parse(companies);
  });
