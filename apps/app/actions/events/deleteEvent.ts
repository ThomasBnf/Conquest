"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteEvent = authAction
  .metadata({
    name: "deleteEvent",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { id } }) => {
    const workspace_id = user.workspace_id;
    const slug = user.workspace.slug;

    await prisma.events.delete({
      where: {
        id,
        workspace_id,
      },
    });

    return revalidatePath(`/app/${slug}/settings/integrations`);
  });
