"use server";

import { env } from "@/env.mjs";
import { upsertIntegration } from "@/features/integrations/actions/upsertIntegration";
import { inngest } from "@/inngest/client";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const oauthV2 = authAction
  .metadata({
    name: "oauthV2",
  })
  .schema(
    z.object({
      code: z.string(),
      scopes: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { code, scopes } }) => {
    const slug = user.workspace.slug;

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

    const rIntegration = await upsertIntegration({
      external_id: team.id,
      name: team.name,
      source: "SLACK",
      token: access_token,
      slack_user_token: authed_user.access_token,
      status: "SYNCING",
      scopes,
    });
    const integration = rIntegration?.data;

    if (!integration) return;

    await inngest.send({
      name: "integrations/slack",
      data: { integration },
    });

    revalidatePath(`/${slug}/settings/integrations/slack`);
    return redirect(`/${slug}/settings/integrations/slack`);
  });
