"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";

export const createCompany = authAction
  .metadata({
    name: "createCompany",
  })
  .schema(
    z.object({
      name: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { name } }) => {
    const workspace_id = user.workspace_id;

    const company = await prisma.companies.create({
      data: {
        name,
        source: "MANUAL",
        workspace_id,
      },
    });

    return CompanySchema.parse(company);
  });
