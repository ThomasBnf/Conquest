"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const addTagsMembers = authAction
  .metadata({
    name: "addTagsMembers",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
      tags: z.array(z.string()),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { ids, tags } }) => {
    const workspace_id = user.workspace_id;

    await prisma.members.updateMany({
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

    return { success: true };
  });
