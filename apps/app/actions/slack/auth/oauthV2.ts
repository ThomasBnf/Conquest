"use server";

import { createIntegration } from "@/actions/integrations/createIntegration";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
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
  .action(async ({ ctx, parsedInput: { code, scopes } }) => {
    const slug = ctx.user.workspace.slug;

    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Slack OAuth error:", data.error);
      throw new Error(`Slack OAuth failed: ${data.error}`);
    }

    const { access_token, team } = data;

    const rIntegration = await createIntegration({
      external_id: team.id,
      name: team.name,
      source: "SLACK",
      token: access_token,
      scopes,
    });
    const integration = rIntegration?.data;

    revalidatePath(`/w/${slug}/settings/integrations/slack`);
    return IntegrationSchema.parse(integration);
  });
