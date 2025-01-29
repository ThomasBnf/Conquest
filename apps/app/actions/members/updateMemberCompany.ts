"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/db/prisma";
import { revalidatePath } from "next/cache";
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
    const { slug } = user.workspace;

    await prisma.members.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        company_id,
      },
    });

    revalidatePath(`/${slug}/companies/${company_id}`);
  });
