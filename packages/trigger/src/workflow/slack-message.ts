import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { getProfileBySource } from "@conquest/db/profile/getProfileBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { plateToSlackBlocks } from "@conquest/utils/plateToSlackBlocks";
import { replaceVariables } from "@conquest/utils/replace-variables";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import {
  Node,
  NodeSlackMessageSchema,
} from "@conquest/zod/schemas/node.schema";
import { WebClient } from "@slack/web-api";
import { nodeStatus } from "./nodeStatus";

type Props = {
  node: Node;
  member: Member;
};

export const slackMessage = async ({ node, member }: Props): Promise<Node> => {
  const parsedNode = NodeSlackMessageSchema.parse(node.data);
  const { message } = parsedNode;

  const { id: memberId, workspaceId } = member;
  const slack = await getIntegrationBySource({ source: "Slack", workspaceId });

  if (!slack) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Slack integration not configured for this workspace",
    });
  }

  const { details } = SlackIntegrationSchema.parse(slack);
  const { userToken, userTokenIv } = details;

  const decryptedUserToken = await decrypt({
    accessToken: userToken,
    iv: userTokenIv,
  });

  if (!decryptedUserToken) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Failed to decrypt Slack user token",
    });
  }

  const web = new WebClient(decryptedUserToken);

  const profile = await getProfileBySource({
    memberId,
    source: "Slack",
    workspaceId,
  });

  if (!profile?.externalId) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Member has no associated Slack account",
    });
  }

  const { channel } = await web.conversations.open({
    users: profile.externalId,
  });

  if (!channel?.id) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Failed to open Slack conversation with user",
    });
  }

  const blocks = await plateToSlackBlocks({ message, member });

  try {
    await web.chat.postMessage({
      channel: channel?.id,
      blocks,
      as_user: true,
    });
  } catch (error) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: `Failed to send Slack message: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  return nodeStatus({ node, status: "COMPLETED" });
};
