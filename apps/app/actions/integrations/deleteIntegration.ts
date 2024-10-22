"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteIntegration = authAction
  .metadata({
    name: "deleteIntegration",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const slug = ctx.user?.workspace.slug;
    const workspace_id = ctx.user?.workspace_id;

    if (!workspace_id) return;

    await prisma.activity.deleteMany({
      where: {
        details: {
          path: ["source"],
          equals: "SLACK",
        },
        workspace_id,
      },
    });

    await prisma.channel.deleteMany({
      where: {
        source: "SLACK",
        workspace_id,
      },
    });

    await prisma.member.deleteMany({
      where: {
        source: "SLACK",
        workspace_id,
      },
    });

    await prisma.integration.delete({
      where: {
        id,
        workspace_id,
      },
    });

    return revalidatePath(`/w/${slug}/settings/integrations`);
  });
