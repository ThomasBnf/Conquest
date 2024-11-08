import { createActivity } from "@/features/activities/functions/createActivity";
import { safeAction } from "@/lib/safeAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const createReaction = safeAction
  .metadata({
    name: "createReaction",
  })
  .schema(
    z.object({
      user: z.string(),
      message: z.string(),
      channel_id: z.string().cuid(),
      react_to: z.string().nullable().optional(),
      ts: z.string(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(
    async ({
      parsedInput: { user, message, channel_id, react_to, ts, workspace_id },
    }) => {
      const member = await prisma.member.findUnique({
        where: {
          slack_id: user,
          workspace_id,
        },
      });

      if (!member) return;

      await createActivity({
        external_id: null,
        details: {
          source: "SLACK",
          type: "REACTION",
          message,
          react_to,
        },
        channel_id,
        member_id: member.id,
        workspace_id,
        created_at: new Date(Number(ts) * 1000),
        updated_at: new Date(Number(ts) * 1000),
      });
    },
  );
