"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { FilterSchema } from "@conquest/zod/schemas/filters.schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const createList = authAction
  .metadata({
    name: "createList",
  })
  .schema(
    z.object({
      emoji: z.string(),
      name: z.string(),
      filters: z.array(FilterSchema),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { emoji, name, filters } }) => {
    const { slug } = user.workspace;
    const workspace_id = user.workspace_id;

    const list = await prisma.lists.create({
      data: {
        emoji,
        name,
        filters,
        workspace_id,
      },
    });

    revalidatePath(`/${slug}`);
    redirect(`/${slug}/lists/${list.id}`);
  });
