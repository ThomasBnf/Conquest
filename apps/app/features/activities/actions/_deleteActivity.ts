"use server";

import { authAction } from "@/lib/authAction";
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

    return await deleteActivity({ id, workspace_id });
  });
