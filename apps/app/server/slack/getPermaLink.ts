import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getPermaLink = protectedProcedure
  .input(
    z.object({
      channelId: z.string().nullish(),
      messageTs: z.string().nullable(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { channelId, messageTs } = input;

    if (!channelId || !messageTs) return null;

    const slack = SlackIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Slack",
        workspaceId,
      }),
    );

    const { details } = slack;
    const { accessToken, accessTokenIv } = details;

    const token = await decrypt({
      accessToken,
      iv: accessTokenIv,
    });

    const web = new WebClient(token);

    const link = await web.chat.getPermalink({
      channel: channelId,
      message_ts: messageTs,
    });

    return link.permalink;
  });
