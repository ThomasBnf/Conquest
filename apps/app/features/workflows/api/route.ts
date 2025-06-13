import { router } from "@/server/trpc";
import { createWorkflow } from "./createWorkflow";
import { deleteWorkflow } from "./deleteWorkflow";
import { duplicateWorkflow } from "./duplicateWorkflow";
import { getWorkflow } from "./getWorkflow";
import { listWorkflows } from "./listWorkflows";
import { sendDiscordTestMessage } from "./send-discord-test-message";
import { sendSlackTestMessage } from "./send-slack-test-message";
import { updateWorkflow } from "./updateWorkflow";

export const workflowsRouter = router({
  list: listWorkflows,
  post: createWorkflow,
  get: getWorkflow,
  update: updateWorkflow,
  delete: deleteWorkflow,
  duplicate: duplicateWorkflow,
  sendSlackTestMessage,
  sendDiscordTestMessage,
});
