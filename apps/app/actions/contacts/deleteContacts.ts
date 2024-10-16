"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteContacts = authAction
  .metadata({
    name: "deleteContacts",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .action(async ({ ctx, parsedInput: { ids } }) => {
    const slug = ctx.user.workspace.slug;

    await prisma.contact.deleteMany({
      where: {
        id: {
          in: ids,
        },
        workspace_id: ctx.user.workspace_id,
      },
    });

    return revalidatePath(`/w/${slug}/contacts`);
  });
