import { SLACK_SCOPES, SLACK_USER_SCOPES } from "@/constant";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { encrypt } from "@conquest/db/utils/encrypt";
import { env } from "@conquest/env";
import { WebClient } from "@slack/web-api";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    error?: string;
    code: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { error, code } = await searchParams;
  const { id, workspaceId } = await getCurrentUser();

  if (error) {
    redirect("/settings/integrations/slack?error=access_denied");
  }

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    redirect("/settings/integrations/slack?error=invalid_code");
  }

  const data = await response.json();
  const { access_token, authed_user } = data;

  const web = new WebClient(access_token);
  const { team } = await web.team.info();

  if (!team?.id || !team?.name || !team?.url) {
    redirect("/settings/integrations/slack?error=invalid_code");
  }

  const integration = await getIntegration({ externalId: team.id });

  if (integration) {
    redirect("/settings/integrations/slack?error=already_connected");
  }

  const encryptedAccessToken = await encrypt(access_token);
  const encryptedUserToken = await encrypt(authed_user.access_token);

  await createIntegration({
    externalId: team.id,
    details: {
      source: "Slack",
      name: team.name,
      url: team.url.slice(0, -1),
      accessToken: encryptedAccessToken.token,
      accessTokenIv: encryptedAccessToken.iv,
      userToken: encryptedUserToken.token,
      userTokenIv: encryptedUserToken.iv,
      scopes: SLACK_SCOPES,
      userScopes: SLACK_USER_SCOPES,
    },
    createdBy: id,
    workspaceId,
  });

  redirect("/settings/integrations/slack");
}
