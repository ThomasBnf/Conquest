"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { CompanySchema } from "@conquest/zod/company.schema";
import { z } from "zod";

export const listCompanies = authAction
  .metadata({
    name: "listCompanies",
  })
  .schema(
    z.object({
      page: z.number(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { page } = parsedInput;
    const workspace_id = ctx.user.workspace_id;

    const companies = await prisma.company.findMany({
      where: {
        workspace_id,
      },
      take: 50,
      skip: (page - 1) * 50,
    });

    return z.array(CompanySchema).parse(companies);
  });
