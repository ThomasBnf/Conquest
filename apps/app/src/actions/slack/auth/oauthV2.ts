"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { WorkspaceSchema } from "@/schemas/workspace.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const oauthV2 = authAction
  .metadata({
    name: "oauthV2",
  })
  .schema(
    z.object({
      code: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { code } }) => {
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
    const slack_token = data.access_token;

    const workspace = await prisma.workspace.update({
      where: {
        id: ctx.user.workspace_id,
      },
      data: {
        slack_token,
      },
    });

    revalidatePath(`/${slug}/settings/integrations/slack`);
    return WorkspaceSchema.parse(workspace);
  });
