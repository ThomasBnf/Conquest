"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { revalidatePath } from "next/cache";

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

    revalidatePath(`/companies/${company.id}`);
    return CompanySchema.parse(company);
  });
