"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
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
  .action(async ({ ctx, parsedInput: { ids } }) => {
    return await prisma.companies.deleteMany({
      where: {
        id: {
          in: ids,
        },
        workspace_id: ctx.user.workspace_id,
      },
    });
  });
