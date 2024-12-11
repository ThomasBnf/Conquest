"use server";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/prisma";
import type { SOURCE } from "@conquest/database";
import {
  type Integration,
  SlackIntegrationSchema,
} from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";

type Props = {
  source: SOURCE;
  integration: Integration;
};

export const deleteIntegration = async ({ source, integration }: Props) => {
  const workspace_id = integration.workspace_id;

  if (source === "SLACK") {
    const slack = SlackIntegrationSchema.parse(integration);
    const web = new WebClient(slack.details.token);

    await prisma.integrations.delete({
      where: {
        id: slack?.id,
      },
    });

    await web.apps.uninstall({
      token: slack?.details.token,
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

  await prisma.workspaces.update({
    where: {
      id: workspace_id,
    },
    data: {
      trigger_token: null,
    },
  });

  return { success: true };
};
