"use server";

import { prisma } from "@/lib/prisma";
import type { SOURCE } from "@conquest/database";
import {
  DiscourseIntegrationSchema,
  type Integration,
  LivestormIntegrationSchema,
  SlackIntegrationSchema,
} from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";

type Props = {
  source: SOURCE;
  integration: Integration;
};

export const deleteIntegration = async ({ source, integration }: Props) => {
  const { workspace_id } = integration;

  if (source === "SLACK") {
    const slack = SlackIntegrationSchema.parse(integration);
    const web = new WebClient(slack.details.token);

    await web.apps.uninstall({
      token: slack.details.token,
      client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
    });

    await prisma.integrations.delete({
      where: { id: slack.id },
    });
  }

  if (source === "DISCOURSE") {
    const discourse = DiscourseIntegrationSchema.parse(integration);
    await prisma.integrations.delete({
      where: { id: discourse.id },
    });
  }

  if (source === "LIVESTORM") {
    const livestorm = LivestormIntegrationSchema.parse(integration);
    await prisma.integrations.delete({
      where: { id: livestorm.id },
    });
  }

  // await Promise.all([
  //   prisma.channels.deleteMany({ where: { source, workspace_id } }),
  //   prisma.companies.deleteMany({ where: { source, workspace_id } }),
  //   prisma.tags.deleteMany({ where: { source, workspace_id } }),
  //   prisma.members.deleteMany({ where: { source, workspace_id } }),
  //   prisma.activities_types.deleteMany({ where: { source, workspace_id } }),
  // ]);

  return { success: true };
};
