"use server";

import { env } from "@/env.mjs";
import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";

export const deleteIntegration = authAction
  .metadata({
    name: "deleteIntegration",
  })
  .schema(
    z.object({
      source: SOURCE,
      integration: IntegrationSchema,
    }),
  )
  .action(async ({ ctx, parsedInput: { integration, source } }) => {
    const workspace_id = ctx.user?.workspace_id;

    if (!workspace_id) return;

    if (integration.details.source === "SLACK") {
      const web = new WebClient(integration.details.token);

      await prisma.integrations.delete({
        where: {
          id: integration.id,
        },
      });

      await web.apps.uninstall({
        token: integration.details.token,
        client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
      });
    }

    await prisma.activities.deleteMany({
      where: {
        activity_type: {
          source: "SLACK",
        },
        workspace_id,
      },
    });

    await prisma.channels.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    await prisma.companies.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    await prisma.tags.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    await prisma.members.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    await prisma.activities_types.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    return { success: true };
  });
