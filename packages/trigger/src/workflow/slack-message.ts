import { getProfileBySource } from "@conquest/clickhouse/profile/getProfileBySource";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { NodeSlackMessage } from "@conquest/zod/schemas/node.schema";
import { WebClient } from "@slack/web-api";
import { logger } from "@trigger.dev/sdk/v3";
import { replaceVariables } from "./replace-variables";

type Props = {
  node: NodeSlackMessage;
  member: MemberWithLevel;
};

export const slackMessage = async ({ node, member }: Props) => {
  const { id: memberId, workspaceId } = member;
  const slack = await getIntegrationBySource({ source: "Slack", workspaceId });

  if (!slack) return logger.error("No Slack integration found");

  const { details } = SlackIntegrationSchema.parse(slack);
  const { userToken, userTokenIv } = details;
  const { message } = node;

  const decryptedUserToken = await decrypt({
    accessToken: userToken,
    iv: userTokenIv,
  });

  if (!userToken) logger.error("No Slack user token found");

  const web = new WebClient(decryptedUserToken);

  const profile = await getProfileBySource({
    source: "Slack",
    memberId,
  });

  if (!profile?.externalId) return logger.error("No Slack profile found");

  const { channel } = await web.conversations.open({
    users: profile.externalId,
  });

  if (!channel?.id) return logger.error("No channel ID found");

  const parsedMessage = replaceVariables({ message, member });

  await web.chat.postMessage({
    channel: channel?.id,
    text: parsedMessage,
    as_user: true,
  });
};
