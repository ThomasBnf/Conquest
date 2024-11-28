"use server";

import { authAction } from "@/lib/authAction";
import { CustomError } from "@/lib/safeAction";
import { installSlack as installSlackTrigger } from "@/trigger/installSlack.trigger";
import type { SlackIntegration } from "@conquest/zod/integration.schema";
import { z } from "zod";

export const installSlack = authAction
  .metadata({
    name: "installSlack",
  })
  .schema(
    z.object({
      channels: z.array(z.string()),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { channels } }) => {
    const slack = user?.workspace.integrations.find(
      (integration) => integration.details.source === "SLACK",
    ) as SlackIntegration | undefined;

    if (!slack) return new CustomError("No Slack integration found", 400);

    installSlackTrigger.trigger({
      integration: slack,
      channels,
    });
  });
