"use server";

import { authAction } from "@/lib/authAction";
import { z } from "zod";
import { listActivities } from "../functions/listActivities";

export const _listActivities = authAction
  .metadata({
    name: "_listActivities",
  })
  .schema(
    z.object({
      member_id: z.string().optional(),
      page: z.number().optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { member_id, page } = parsedInput;
    const workspace_id = ctx.user.workspace_id;

    const rActivities = await listActivities({ page, member_id, workspace_id });

    return rActivities?.data;
  });
