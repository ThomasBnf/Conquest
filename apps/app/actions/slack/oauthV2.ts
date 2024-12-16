"use server";

import { SCOPES, SLACK_ACTIVITY_TYPES, USER_SCOPES } from "@/constant";
import { env } from "@/env.mjs";
import { createIntegration } from "@/queries/integrations/createIntegration";
import { authAction } from "lib/authAction";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createActivitiesTypes } from "./createActivitiesTypes";

export const oauthV2 = authAction
  .metadata({
    name: "oauthV2",
  })
  .schema(
    z.object({
      code: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { code } }) => {
    const slug = user.workspace.slug;
    const workspace_id = user.workspace_id;

    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
        redirect_uri: `${env.NEXT_PUBLIC_SLACK_REDIRECT_URI}/${slug}/settings/integrations/slack`,
      }),
    });

    const data = await response.json();
    const { access_token, authed_user, team } = data;

    const integration = await createIntegration({
      external_id: team.id,
      details: {
        source: "SLACK",
        name: team.name,
        token: access_token,
        slack_user_token: authed_user.access_token,
        scopes: SCOPES,
        user_scopes: USER_SCOPES,
      },
      workspace_id,
    });

    if (!integration) return;

    createActivitiesTypes({
      activity_types: SLACK_ACTIVITY_TYPES,
    });

    return redirect(`/${slug}/settings/integrations/slack`);
  });
