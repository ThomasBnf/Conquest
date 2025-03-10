import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { protectedProcedure } from "../trpc";

export const listChannels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const slack = SlackIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Slack",
        workspace_id,
      }),
    );

    const { details } = slack;
    const { access_token, access_token_iv } = details;

    const token = await decrypt({
      access_token: access_token,
      iv: access_token_iv,
    });

    const web = new WebClient(token);

    const { channels } = await web.conversations.list({
      types: "public_channel",
      exclude_archived: true,
    });

    return channels;
  },
);
