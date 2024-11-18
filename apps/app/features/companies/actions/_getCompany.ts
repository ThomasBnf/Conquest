"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { CompanySchema } from "@conquest/zod/company.schema";
import { z } from "zod";

export const _getCompany = authAction
  .metadata({
    name: "_getCompany",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { id } }) => {
    const workspace_id = user.workspace_id;

    const company = await prisma.company.findUnique({
      where: { id, workspace_id },
    });

    return CompanySchema.parse(company);
  });
