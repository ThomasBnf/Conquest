import { BulkActivitySchema } from "@/features/table/schemas/bulk-activity.schema";
import { getActivityTypeByKey } from "@conquest/clickhouse/activity-types/getActivityTypeByKey";
import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createManyActivities = protectedProcedure
  .input(BulkActivitySchema.extend({ members: z.array(MemberSchema) }))
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { activityTypeKey, message, members } = input;

    const activityType = await getActivityTypeByKey({
      key: activityTypeKey,
      workspaceId,
    });

    if (!activityType) throw new Error("Activity type not found");

    const activities = members.map((member) => ({
      activityTypeId: activityType.id,
      message,
      memberId: member.id,
      source: activityType.source,
      workspaceId,
    }));

    await client.insert({
      table: "activity",
      values: activities,
      format: "JSON",
    });
  });
