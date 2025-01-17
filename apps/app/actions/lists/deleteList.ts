"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteList = authAction
  .metadata({
    name: "deleteList",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { id } }) => {
    const { slug } = user.workspace;
    const workspace_id = user.workspace_id;

    await prisma.lists.delete({
      where: {
        id,
        workspace_id,
      },
    });

    revalidatePath(`/${slug}`);
    redirect(`/${slug}/members`);
  });
