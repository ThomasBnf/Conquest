"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ActivityWithMemberSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const getActivity = authAction
  .metadata({
    name: "getActivity",
  })
  .schema(
    z.object({
      ts: z.string().optional(),
      type: z.literal("MESSAGE").optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { ts, type } }) => {
    const AND = type ? [{ details: { path: ["type"], equals: type } }] : [];
    const activity = await prisma.activity.findFirst({
      where: {
        details: {
          path: ["ts"],
          equals: ts,
        },
        AND,
        workspace_id: ctx.user.workspace_id,
      },
      include: {
        member: true,
      },
    });

    return ActivityWithMemberSchema.parse(activity);
  });
