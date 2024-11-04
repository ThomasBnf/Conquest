"use server";

import { env } from "@/env.mjs";
import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const disconnectIntegration = authAction
  .metadata({
    name: "disconnectIntegration",
  })
  .schema(
    z.object({
      integration: IntegrationSchema,
    }),
  )
  .action(async ({ ctx, parsedInput: { integration } }) => {
    const slug = ctx.user?.workspace.slug;
    const workspace_id = ctx.user?.workspace_id;

    if (!workspace_id) return;

    const web = new WebClient(integration.token);

    await web.apps.uninstall({
      token: integration.token,
      client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
    });

    await prisma.integration.update({
      where: {
        id: integration.id,
      },
      data: {
        status: "DISCONNECTED",
        installed_at: null,
      },
    });

    await prisma.activity.deleteMany({
      where: {
        details: {
          path: ["source"],
          equals: "SLACK",
        },
        workspace_id,
      },
    });

    await prisma.channel.deleteMany({
      where: {
        source: "SLACK",
        workspace_id,
      },
    });

    await prisma.member.deleteMany({
      where: {
        source: "SLACK",
        workspace_id,
      },
    });

    return revalidatePath(`/${slug}/settings/integrations`);
  });
