"use server";

import { listActivities } from "@/features/activities/queries/listActivities";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const listActivitiesAction = safeAction
  .metadata({ name: "listActivitiesAction" })
  .schema(
    z.object({
      member_id: z.string().optional(),
      page: z.number().optional(),
      from: z.date().optional(),
      to: z.date().optional(),
    }),
  )
  .action(async ({ parsedInput: { member_id, page, from, to } }) => {
    const rActivities = await listActivities({ member_id, page, from, to });
    return rActivities?.data;
  });
