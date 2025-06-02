import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { getSlackProfile } from "./getSlackProfile";

type Props = {
  members: Record<string, string>[];
  workspaceId: string;
};

export const processSlackProfiles = async ({ members, workspaceId }: Props) => {
  const slackMembers = members.filter(
    (member) => member.slackId && member.slackId.trim() !== "",
  );

  const slackIntegration = SlackIntegrationSchema.parse(
    await getIntegrationBySource({ source: "Slack", workspaceId }),
  );

  const { details } = slackIntegration;
  const { accessToken, accessTokenIv } = details;

  const token = await decrypt({
    accessToken,
    iv: accessTokenIv,
  });

  const web = new WebClient(token);

  for (const member of slackMembers) {
    const { slackId } = member;

    if (!slackId) continue;

    const profile = await getProfile({
      externalId: slackId,
      workspaceId,
    });

    if (profile) await getSlackProfile({ web, profile });
  }
};
