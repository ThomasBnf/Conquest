"use server";

import { WebClient } from "@slack/web-api";
import { authAction } from "lib/authAction";
import { z } from "zod";
import { createUsers } from "./createUsers";
import { listChannels } from "./listChannels";

export const runSlack = authAction
  .metadata({
    name: "runSlack",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx }) => {
    const slack_token = ctx.user.workspace.integrations.find(
      (integration) => integration.source === "SLACK",
    )?.token;

    if (!slack_token) return;
    const web = new WebClient(slack_token);

    await createUsers({ web });
    await listChannels({ web, token: slack_token });
  });
