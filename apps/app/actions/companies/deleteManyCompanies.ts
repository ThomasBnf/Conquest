"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteManyCompanies = authAction
  .metadata({
    name: "deleteManyCompanies",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { ids } }) => {
    const { workspace_id, workspace } = user;
    const { slug } = workspace;

    await prisma.companies.deleteMany({
      where: {
        id: {
          in: ids,
        },
        workspace_id,
      },
    });

    return revalidatePath(`/${slug}/companies`);
  });
