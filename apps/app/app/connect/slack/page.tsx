import { SLACK_SCOPES, USER_SCOPES } from "@/constant";
import { env } from "@/env.mjs";
import { createIntegration } from "@/queries/integrations/createIntegration";
import { getIntegration } from "@/queries/integrations/getIntegration";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { WebClient } from "@slack/web-api";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    error?: string;
    code: string;
  };
};

export default async function Page({ searchParams: { error, code } }: Props) {
  const user = await getCurrentUser();
  const { slug, id: workspace_id } = user.workspace;

  if (error) {
    redirect(`/${slug}/settings/integrations/slack?error=access_denied`);
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
    return redirect(`/${slug}/settings/integrations/slack?error=invalid_code`);
  }

  const data = await response.json();
  const { access_token, authed_user } = data;

  const web = new WebClient(access_token);
  const responseTeam = await web.team.info();
  console.log(responseTeam);
  const { team } = responseTeam;

  if (!team?.id || !team?.name || !team?.url) {
    return redirect(`/${slug}/settings/integrations/slack?error=invalid_code`);
  }

  const integration = await getIntegration({
    external_id: team.id,
  });

  console.log(integration);

  if (integration) {
    return redirect(
      `/${slug}/settings/integrations/slack?error=already_connected`,
    );
  }

  await createIntegration({
    external_id: team.id,
    details: {
      source: "SLACK" as const,
      name: team.name,
      url: team.url,
      token: access_token,
      slack_user_token: authed_user.access_token,
      scopes: SLACK_SCOPES,
      user_scopes: USER_SCOPES,
    },
    created_by: user.id,
    workspace_id,
  });

  redirect(`/${slug}/settings/integrations/slack`);
}
