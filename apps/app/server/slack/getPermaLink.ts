import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getPermaLink = protectedProcedure
  .input(
    z.object({
      slack: SlackIntegrationSchema.nullable(),
      channel_id: z.string().nullish(),
      message_ts: z.string().nullable(),
    }),
  )
  .query(async ({ input }) => {
    const { slack, channel_id, message_ts } = input;
    const { token } = slack?.details ?? {};

    if (!token || !channel_id || !message_ts) return null;

    const web = new WebClient(token);

    const link = await web.chat.getPermalink({
      channel: channel_id,
      message_ts,
    });

    return link.permalink;
  });
