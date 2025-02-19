import { decrypt } from "@conquest/db/lib/decrypt";
import { getIntegrationBySource } from "@conquest/db/queries/integration/getIntegrationBySource";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getPermaLink = protectedProcedure
  .input(
    z.object({
      channel_id: z.string().nullish(),
      message_ts: z.string().nullable(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { channel_id, message_ts } = input;

    if (!channel_id || !message_ts) return null;

    const slack = SlackIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "SLACK",
        workspace_id,
      }),
    );

    const { access_token, access_token_iv } = slack.details;

    const token = await decrypt({
      access_token: access_token,
      iv: access_token_iv,
    });

    const web = new WebClient(token);

    const link = await web.chat.getPermalink({
      channel: channel_id,
      message_ts,
    });

    return link.permalink;
  });
