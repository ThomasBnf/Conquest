"use server";

import { authAction } from "@/lib/authAction";
import { createActivity as _createActivity } from "@/queries/activities/createActivity";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { z } from "zod";

export const createActivity = authAction
  .metadata({
    name: "createActivity",
  })
  .schema(
    z.object({
      member_id: z.string(),
      message: z.string(),
      activity_type_id: z.string(),
    }),
  )
  .action(
    async ({
      ctx: { user },
      parsedInput: { member_id, message, activity_type_id },
    }) => {
      const workspace_id = user.workspace_id;

      const activity = await _createActivity({
        external_id: null,
        activity_type_id,
        message,
        member_id,
        workspace_id,
      });

      return ActivitySchema.parse(activity);
    },
  );
