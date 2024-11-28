"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { CompanyWithMembersSchema } from "@conquest/zod/company.schema";
import { z } from "zod";

export const _getCompany = authAction
  .metadata({
    name: "_getCompany",
  })
  .schema(
    z.object({
      id: z.string().nullable(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { id } }) => {
    const workspace_id = user.workspace_id;

    if (!id) return null;

    const company = await prisma.companies.findUnique({
      where: { id, workspace_id },
      include: { members: true },
    });

    return CompanyWithMembersSchema.parse(company);
  });
