"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteMembersAction = authAction
  .metadata({
    name: "deleteMembersAction",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .action(async ({ ctx, parsedInput: { ids } }) => {
    const slug = ctx.user.workspace.slug;

    await prisma.member.deleteMany({
      where: {
        id: {
          in: ids,
        },
        workspace_id: ctx.user.workspace_id,
      },
    });

    return revalidatePath(`/w/${slug}/members`);
  });
