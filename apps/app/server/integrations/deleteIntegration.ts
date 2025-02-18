import { prisma } from "@conquest/db/prisma";
import { listSubscriptions } from "@conquest/db/queries/linkedin/listSubscriptions";
import { removeWebhook } from "@conquest/db/queries/linkedin/removeWebhook";
import { deleteWebhook } from "@conquest/db/queries/livestorm/deleteWebhhok";
import { listWebhooks } from "@conquest/db/queries/livestorm/listWebhooks";
import { env } from "@conquest/env";
import {
  IntegrationSchema,
  LinkedInIntegrationSchema,
  LivestormIntegrationSchema,
  SlackIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteIntegration = protectedProcedure
  .input(
    z.object({
      integration: IntegrationSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { integration } = input;
    const { source } = integration.details;

    if (source === "LIVESTORM") {
      const livestorm = LivestormIntegrationSchema.parse(integration);
      const { access_token } = livestorm.details;

      await prisma.event.deleteMany({
        where: { source: "LIVESTORM", workspace_id },
      });

      const webhooks = await listWebhooks({ accessToken: access_token });

      for (const webhook of webhooks) {
        await deleteWebhook({ accessToken: access_token, id: webhook.id });
      }
    }

    if (source === "SLACK") {
      const slack = SlackIntegrationSchema.parse(integration);
      const web = new WebClient(slack.details.token);

      await web.apps.uninstall({
        token: slack.details.token,
        client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
      });
    }

    if (source === "LINKEDIN") {
      const linkedin = LinkedInIntegrationSchema.parse(integration);

      await prisma.post.deleteMany({ where: { workspace_id } });

      const { subscriptions } = await listSubscriptions({ linkedin });

      if (subscriptions.elements.length > 0) {
        await removeWebhook({ linkedin });
      }
    }

    if (source === "DISCORD") {
      await prisma.event.deleteMany({
        where: { source: "DISCORD", workspace_id },
      });
    }

    await Promise.all([
      prisma.activity_type.deleteMany({ where: { source, workspace_id } }),
      prisma.channel.deleteMany({ where: { source, workspace_id } }),
      prisma.tag.deleteMany({ where: { source, workspace_id } }),
      prisma.company.deleteMany({ where: { source, workspace_id } }),
    ]);

    await prisma.member.deleteMany({ where: { source, workspace_id } });
    await prisma.integration.delete({ where: { id: integration.id } });
  });
