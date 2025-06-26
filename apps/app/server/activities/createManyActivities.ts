import { BulkActivitySchema } from "@/features/table/schemas/bulk-activity.schema";
import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createManyActivities = protectedProcedure
  .input(
    BulkActivitySchema.extend({
      members: z.array(MemberSchema),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { activityTypeKey, message, members } = input;

    const activities = members.map((member) => ({
      activityTypeKey,
      message,
      memberId: member.id,
      source: "Manual" as const,
      workspaceId,
    }));

    await prisma.activity.createMany({
      data: activities,
    });
  });
