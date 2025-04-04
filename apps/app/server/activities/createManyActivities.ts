import { BulkActivitySchema } from "@/features/table/schemas/bulk-activity.schema";
import { getActivityTypeByKey } from "@conquest/clickhouse/activity-types/getActivityTypeByKey";
import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createManyActivities = protectedProcedure
  .input(BulkActivitySchema.extend({ members: z.array(MemberSchema) }))
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { activity_type_key, message, members } = input;

    console.log(members);

    const activityType = await getActivityTypeByKey({
      key: activity_type_key,
      workspace_id,
    });

    if (!activityType) throw new Error("Activity type not found");

    console.log(activityType);

    const activities = members.map((member) => ({
      activity_type_id: activityType.id,
      message,
      member_id: member.id,
      source: activityType.source,
      workspace_id,
    }));

    console.log(activities);

    await client.insert({
      table: "activity",
      values: activities,
      format: "JSON",
    });
  });
