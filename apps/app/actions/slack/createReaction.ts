"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";
import { createActivity } from "../activities/createActivity";

export const createReaction = authAction
  .metadata({
    name: "createReaction",
  })
  .schema(
    z.object({
      user: z.string(),
      message: z.string(),
      reference: z.string().cuid(),
      channel_id: z.string().cuid(),
      ts: z.string(),
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: { user, message, reference, channel_id, ts },
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
        details: {
          source: "SLACK",
          type: "REACTION",
          message,
          reference,
          ts,
        },
        channel_id,
        member_id: member.id,
        created_at: new Date(Number(ts) * 1000),
        updated_at: new Date(Number(ts) * 1000),
      });
    },
  );
