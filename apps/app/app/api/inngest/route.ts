import { InngestCronWorkflow } from "@/inngest/InngestCronWorkflow";
import { InngestRunWorkflow } from "@/inngest/InngestRunWorkflow";
import { inngest } from "@/inngest/client";
import { InngestInstalSlack } from "@/inngest/slack/InngestInstalSlack";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [InngestRunWorkflow, InngestInstalSlack, InngestCronWorkflow],
});
