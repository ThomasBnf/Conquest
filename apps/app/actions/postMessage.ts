"use server";

import { authAction } from "@/lib/authAction";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";

export const postMessage = authAction
  .metadata({
    name: "postMessage",
  })
  .action(async ({ ctx: { user } }) => {
    const integration = user.workspace.integrations.find(
      (integration) => integration.source === "SLACK",
    );

    if (!integration) return;

    const { slack_user_token } = IntegrationSchema.parse(integration);
    const web = new WebClient(slack_user_token ?? "");

    const { channel } = await web.conversations.open({
      users: "U07U8BMUYRM",
    });

    if (!channel?.id) return;

    const result = await web.chat.postMessage({
      channel: channel?.id,
      text: "Hello, Audrey!",
      as_user: true,
    });

    console.log(result);
  });
