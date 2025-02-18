import { prisma } from "@conquest/db/prisma";
import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getActivity = protectedProcedure
  .input(
    z.object({
      external_id: z.string().nullable(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { external_id } = input;

    if (!external_id) return null;

    const activity = await prisma.activity.findUnique({
      where: {
        external_id_workspace_id: {
          external_id,
          workspace_id,
        },
      },
      include: {
        activity_type: true,
      },
    });

    return ActivityWithTypeSchema.parse(activity);
  });
