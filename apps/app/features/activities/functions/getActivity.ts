import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ActivityWithMemberSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const getActivity = safeAction
  .metadata({
    name: "getActivity",
  })
  .schema(
    z.object({
      external_id: z.string(),
      workspace_id: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { external_id, workspace_id } = parsedInput;

    const activity = await prisma.activity.findUnique({
      where: {
        external_id,
        workspace_id,
      },
      include: {
        member: true,
      },
    });

    return ActivityWithMemberSchema.parse(activity);
  });
