"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateListMembers = authAction
  .metadata({
    name: "updateListMembers",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
      tags: z.array(z.string()),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { ids, tags } }) => {
    const workspace_id = user.workspace_id;
    const slug = user.workspace.slug;

    const selectedMembers = await prisma.members.findMany({
      where: {
        id: {
          in: ids,
        },
        workspace_id,
      },
    });

    for (const member of selectedMembers) {
      await prisma.members.update({
        where: {
          id: member.id,
          workspace_id,
        },
        data: {
          tags: {
            push: tags,
          },
        },
      });
    }

    revalidatePath(`/${slug}/members`);
    return { success: true };
  });
