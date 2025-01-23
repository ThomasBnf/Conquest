"use server";

import { authAction } from "@/lib/authAction";
import { deleteActivity as _deleteActivity } from "@/queries/activities/deleteActivity";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { z } from "zod";

export const deleteActivity = authAction
  .metadata({
    name: "deleteActivity",
  })
  .schema(
    z.object({
      id: z.string(),
      external_id: z.string().optional(),
      channel_id: z.string().optional(),
    }),
  )
  .action(
    async ({ ctx: { user }, parsedInput: { id, external_id, channel_id } }) => {
      const { workspace_id } = user;

      await _deleteActivity({ id, external_id, channel_id, workspace_id });
      return revalidatePath("/activities");
    },
  );
