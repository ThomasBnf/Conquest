"use server";

import { authAction } from "@/lib/authAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteActivity } from "../functions/deleteActivity";

export const _deleteActivity = authAction
  .metadata({
    name: "_deleteActivity",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;
    const workspace_id = ctx.user.workspace_id;
    const slug = ctx.user.workspace.slug;

    await deleteActivity({ id, workspace_id });

    return revalidatePath(`/${slug}/activities`);
  });
