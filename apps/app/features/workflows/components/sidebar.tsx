import { useWorkflow } from "@/context/workflowContext";
import { ActionPanel } from "../panels/action-panel";
import { OptionsPanel } from "../panels/options-panel";
import { TriggerPanel } from "../panels/trigger-panel";
import { WorkflowPanel } from "../panels/workflow-panel";

export const Sidebar = () => {
  const { currentNode, panel } = useWorkflow();

  return (
    <div className="flex w-full max-w-sm flex-col">
      {currentNode && <OptionsPanel />}
      {!currentNode && panel === "workflow" && <WorkflowPanel />}
      {!currentNode && panel === "trigger" && <TriggerPanel />}
      {!currentNode && panel === "action" && <ActionPanel />}
    </div>
  );
};
