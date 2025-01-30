"use server";

import { FormCreateSchema } from "@/features/companies/schema/company-form.schema";
import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { revalidatePath } from "next/cache";

export const createCompany = authAction
  .metadata({
    name: "createCompany",
  })
  .schema(FormCreateSchema)
  .action(async ({ ctx: { user }, parsedInput: { name } }) => {
    const workspace_id = user.workspace_id;

    const company = await prisma.companies.create({
      data: {
        name,
        source: "MANUAL",
        workspace_id,
      },
    });

    revalidatePath("/members");
    return CompanySchema.parse(company);
  });
