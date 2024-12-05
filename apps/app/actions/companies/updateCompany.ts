"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { CompanySchema } from "@conquest/zod/company.schema";

export const updateCompany = authAction
  .metadata({
    name: "updateCompany",
  })
  .schema(CompanySchema.partial())
  .action(async ({ ctx: { user }, parsedInput: { id, ...data } }) => {
    const workspace_id = user.workspace_id;

    const company = await prisma.companies.update({
      where: { id, workspace_id },
      data,
    });

    return CompanySchema.parse(company);
  });
