import { decrypt } from "@conquest/db/lib/decrypt";
import { getIntegrationBySource } from "@conquest/db/queries/integration/getIntegrationBySource";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { protectedProcedure } from "../trpc";

export const listChannels = protectedProcedure.query(
  async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

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

    const { channels } = await web.conversations.list({
      types: "public_channel",
      exclude_archived: true,
    });

    return channels;
  },
);
