"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const removeTagsMembers = authAction
  .metadata({
    name: "removeTagsMembers",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
      tags: z.array(z.string()),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { ids, tags } }) => {
    const workspace_id = user.workspace_id;

    const members = await prisma.members.findMany({
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

    for (const member of members) {
      const updatedTags = member.tags.filter((tag) => !tags.includes(tag));

      await prisma.members.update({
        where: {
          id: member.id,
          workspace_id,
        },
        data: {
          tags: updatedTags,
        },
      });
    }
  });
