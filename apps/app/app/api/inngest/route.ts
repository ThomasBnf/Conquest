import { InngestCronWorkflow } from "@/inngest/InngestCronWorkflow";
import { InngestInstalSlack } from "@/inngest/InngestInstalSlack";
import { InngestRunWorkflow } from "@/inngest/InngestRunWorkflow";
import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [InngestRunWorkflow, InngestInstalSlack, InngestCronWorkflow],
});
