import { router } from "../trpc";
import { createWorkflow } from "./createWorkflow";
import { deleteWorkflow } from "./deleteWorkflow";
import { duplicateWorkflow } from "./duplicateWorkflow";
import { getWorkflow } from "./getWorkflow";
import { listWorkflows } from "./listWorkflows";
import { updateWorkflow } from "./updateWorkflow";

export const workflowsRouter = router({
  list: listWorkflows,
  post: createWorkflow,
  get: getWorkflow,
  update: updateWorkflow,
  delete: deleteWorkflow,
  duplicate: duplicateWorkflow,
});
