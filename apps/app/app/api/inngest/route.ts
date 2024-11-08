import { InngestCronWorkflow } from "@/inngest/InngestCronWorkflow";
import { InngestRunWorkflow } from "@/inngest/InngestRunWorkflow";
import { inngest } from "@/inngest/client";
import { InngestInstallSlack } from "@/inngest/slack/InngestInstallSlack";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [InngestRunWorkflow, InngestCronWorkflow, InngestInstallSlack],
});
