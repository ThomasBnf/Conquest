"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const addTagsCompanies = authAction
  .metadata({
    name: "addTagsCompanies",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
      tags: z.array(z.string()),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { ids, tags } }) => {
    const workspace_id = user.workspace_id;

    return await prisma.companies.updateMany({
      where: {
        id: {
          in: ids,
        },
        NOT: {
          tags: {
            hasSome: tags,
          },
        },
        workspace_id,
      },
      data: {
        tags: {
          push: tags,
        },
      },
    });
  });
