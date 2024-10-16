"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteContact = authAction
  .metadata({ name: "deleteContact" })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const slug = ctx.user.workspace.slug;

    await prisma.contact.delete({
      where: {
        id,
      },
    });

    revalidatePath(`/w/${slug}/contacts`);
    redirect(`/w/${slug}/contacts`);
  });
