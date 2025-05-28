import { getProfileBySource } from "@conquest/clickhouse/profile/getProfileBySource";
import { discordClient } from "@conquest/db/discord";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import {
  Node,
  NodeDiscordMessageSchema,
} from "@conquest/zod/schemas/node.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { APIDMChannel, Routes } from "discord-api-types/v10";
import { nodeStatus } from "./nodeStatus";
import { replaceVariables } from "./replace-variables";

type Props = {
  node: Node;
  member: MemberWithLevel;
};

export const discordMessage = async ({
  node,
  member,
}: Props): Promise<Node> => {
  const parsedNode = NodeDiscordMessageSchema.parse(node.data);
  const { message } = parsedNode;

  logger.info("member", { member });

  const { id: memberId, workspaceId } = member;
  const discord = await getIntegrationBySource({
    source: "Discord",
    workspaceId,
  });

  if (!discord) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Discord integration not configured for this workspace",
    });
  }

  const { details } = DiscordIntegrationSchema.parse(discord);
  const { accessToken, accessTokenIv } = details;

  const decryptedUserToken = await decrypt({
    accessToken,
    iv: accessTokenIv,
  });

  if (!decryptedUserToken) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Failed to decrypt Discord access token",
    });
  }

  const profile = await getProfileBySource({
    source: "Discord",
    memberId,
  });

  if (!profile?.externalId) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Member has no associated Discord account",
    });
  }

  const channel = (await discordClient.post(Routes.userChannels(), {
    body: {
      recipient_id: profile.externalId,
    },
  })) as APIDMChannel;

  logger.info("channel", { channel });

  if (!channel?.id) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Failed to open Discord conversation with user",
    });
  }

  const parsedMessage = await replaceVariables({
    message,
    member,
    source: "Discord",
  });
  logger.info("parsedMessage", { parsedMessage });

  try {
    await discordClient.post(Routes.channelMessages(channel.id), {
      body: {
        content: parsedMessage,
      },
    });
  } catch (error) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: `Failed to send Discord message: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  return nodeStatus({ node, status: "COMPLETED" });
};
