import { inngest } from "@/inngest/client";
import { runWorkflowInngest } from "@/inngest/runWorkflow";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runWorkflowInngest],
});
