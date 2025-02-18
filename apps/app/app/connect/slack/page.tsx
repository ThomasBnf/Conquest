import { SLACK_SCOPES, SLACK_USER_SCOPES } from "@/constant";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/queries/integration/createIntegration";
import { getIntegration } from "@conquest/db/queries/integration/getIntegration";
import { env } from "@conquest/env";
import { WebClient } from "@slack/web-api";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    error?: string;
    code: string;
  };
};

export default async function Page({ searchParams: { error, code } }: Props) {
  const { id, workspace_id } = await getCurrentUser();

  if (error) redirect("/settings/integrations/slack?error=access_denied");

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
    return redirect("/settings/integrations/slack?error=invalid_code");
  }

  const data = await response.json();
  const { access_token, authed_user } = data;

  const web = new WebClient(access_token);
  const { team } = await web.team.info();

  if (!team?.id || !team?.name || !team?.url) {
    return redirect("/settings/integrations/slack?error=invalid_code");
  }

  const integration = await getIntegration({
    external_id: team.id,
  });

  if (integration) {
    return redirect("/settings/integrations/slack?error=already_connected");
  }

  await createIntegration({
    external_id: team.id,
    details: {
      source: "SLACK",
      name: team.name,
      url: team.url.slice(0, -1),
      token: access_token,
      slack_user_token: authed_user.access_token,
      scopes: SLACK_SCOPES,
      user_scopes: SLACK_USER_SCOPES,
    },
    created_by: id,
    workspace_id,
  });

  redirect("/settings/integrations/slack");
}
