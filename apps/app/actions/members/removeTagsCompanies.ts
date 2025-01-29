"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/db/prisma";
import { z } from "zod";

export const removeTagsCompanies = authAction
  .metadata({
    name: "removeTagsCompanies",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
      tags: z.array(z.string()),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { ids, tags } }) => {
    const workspace_id = user.workspace_id;

    const companies = await prisma.companies.findMany({
      where: {
        id: {
          in: ids,
        },
        tags: {
          hasSome: tags,
        },
        workspace_id,
      },
    });

    for (const company of companies) {
      const updatedTags = company.tags.filter((tag) => !tags.includes(tag));

      await prisma.companies.update({
        where: {
          id: company.id,
          workspace_id,
        },
        data: {
          tags: updatedTags,
        },
      });
    }
  });
