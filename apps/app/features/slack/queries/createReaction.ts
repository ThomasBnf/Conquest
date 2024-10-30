import { createActivity } from "@/features/activities/queries/createActivity";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const createReaction = authAction
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
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: { user, message, channel_id, react_to, ts },
    }) => {
      const workspace_id = ctx.user.workspace_id;

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
        created_at: new Date(Number(ts) * 1000),
        updated_at: new Date(Number(ts) * 1000),
      });
    },
  );
