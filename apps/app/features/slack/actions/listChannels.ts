"use server";

import { authAction } from "@/lib/authAction";
import type { SlackIntegration } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";

export const listChannels = authAction
  .metadata({
    name: "listChannels",
  })
  .action(async ({ ctx: { user } }) => {
    const slack = user?.workspace.integrations.find(
      (integration) => integration.details.source === "SLACK",
    ) as SlackIntegration | undefined;

    if (!slack) return [];

    const { token, slack_user_token } = slack.details;

    if (!token || !slack_user_token) return [];

    const web = new WebClient(token);

    const { channels } = await web.conversations.list({
      types: "public_channel,private_channel",
      exclude_archived: true,
    });

    return channels;
  });
