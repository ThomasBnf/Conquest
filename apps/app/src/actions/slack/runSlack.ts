"use server";

import { authAction } from "@/lib/authAction";
import { WebClient } from "@slack/web-api";
import { createUsers } from "./createUsers";
import { listChannels } from "./listChannels";

export const runSlack = authAction
  .metadata({
    name: "runSlack",
  })
  .action(async ({ ctx }) => {
    const slack_token = ctx.user.workspace.slack_token;

    if (!slack_token) return;
    const web = new WebClient(slack_token);

    await createUsers({ web });
    await listChannels({ web });
  });
