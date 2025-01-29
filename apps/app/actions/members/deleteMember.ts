"use server";

import { prisma } from "@conquest/db/prisma";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteMember = authAction
  .metadata({ name: "deleteMember" })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const slug = ctx.user.workspace.slug;

    await prisma.members.delete({
      where: {
        id,
      },
    });

    revalidatePath(`/${slug}/members`);
    redirect(`/${slug}/members`);
  });
