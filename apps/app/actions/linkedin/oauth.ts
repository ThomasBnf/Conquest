"use server";

import { authAction } from "@/lib/authAction";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createIntegration } from "../integrations/createIntegration";

export const oauth = authAction
  .metadata({
    name: "oauth",
  })
  .schema(
    z.object({
      code: z.string(),
      client_id: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { code, client_id } }) => {
    const workspace_id = user.workspace_id;
    const slug = user.workspace.slug;

    console.log(code);
    console.log(client_id);

    const response = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: "781lxs91j5icyv",
          client_secret: "WPL_AP1.VHFensRJPr7j79oP.N1Qwmw==",
          redirect_uri:
            "https://d9362cfb1ab6.ngrok.app/conquest/settings/integrations/linkedin",
        }),
      },
    );

    const data = await response.json();

    console.log(data);

    const integration = await createIntegration({
      external_id: null,
      details: {
        source: "LINKEDIN",
        access_token: data.access_token,
        expire_in: data.expires_in,
        scope: data.scope,
      },
    });

    return redirect(`/${slug}/settings/integrations/linkedin`);
  });
