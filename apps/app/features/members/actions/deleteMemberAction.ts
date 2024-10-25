"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteMemberAction = authAction
  .metadata({ name: "deleteMemberAction" })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const slug = ctx.user.workspace.slug;

    await prisma.member.delete({
      where: {
        id,
      },
    });

    revalidatePath(`/${slug}/members`);
    redirect(`/${slug}/members`);
  });
