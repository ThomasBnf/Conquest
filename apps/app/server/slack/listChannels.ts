import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { protectedProcedure } from "../trpc";

export const listChannels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

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

    const { channels } = await web.conversations.list({
      types: "public_channel",
      exclude_archived: true,
    });

    return channels;
  },
);
