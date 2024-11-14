"use server";

import { env } from "@/env.mjs";
import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { SOURCE } from "@conquest/zod/source.enum";
import { WebClient } from "@slack/web-api";
import { revalidatePath } from "next/cache";
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
    const slug = ctx.user?.workspace.slug;
    const workspace_id = ctx.user?.workspace_id;

    if (!workspace_id) return;

    if (integration.details.source === "SLACK") {
      const web = new WebClient(integration.details.token);

      await web.apps.uninstall({
        token: integration.details.token,
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
    } else {
      await prisma.integration.delete({
        where: {
          id: integration.id,
        },
      });
    }

    await prisma.activity.deleteMany({
      where: {
        details: {
          path: ["source"],
          equals: source,
        },
        workspace_id,
      },
    });

    await prisma.channel.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    await prisma.company.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    await prisma.tag.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    await prisma.member.deleteMany({
      where: {
        source,
        workspace_id,
      },
    });

    revalidatePath(`/${slug}/settings/integrations`);
    return { success: true };
  });
