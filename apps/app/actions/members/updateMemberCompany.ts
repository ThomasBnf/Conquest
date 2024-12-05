"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const updateMemberCompany = authAction
  .metadata({
    name: "updateMemberCompany",
  })
  .schema(
    z.object({
      id: z.string(),
      company_id: z.string().nullable(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { id, company_id } }) => {
    const workspace_id = user.workspace_id;

    await prisma.members.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        company_id,
      },
    });
  });
