import { InngestCronWorkflow } from "@/inngest/InngestCronWorkflow";
import { InngestRunWorkflow } from "@/inngest/InngestRunWorkflow";
import { inngest } from "@/inngest/client";
import { InngestCreateListChannels } from "@/inngest/slack/InngestCreateListChannels";
import { InngestCreateListMembers } from "@/inngest/slack/InngestCreateListMembers";
import { InngestCreateMessage } from "@/inngest/slack/InngestCreateMessage";
import { InngestInstalSlack } from "@/inngest/slack/InngestInstalSlack";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    InngestRunWorkflow,
    InngestCronWorkflow,
    InngestInstalSlack,
    InngestCreateListMembers,
    InngestCreateListChannels,
    InngestCreateMessage,
  ],
});
