import { Button } from "@conquest/ui/button";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { useReactFlow } from "@xyflow/react";
import { ArrowLeft } from "lucide-react";
import { useWorkflow } from "../context/workflowContext";
import { ActionPanel } from "../panels/action-panel";
import { OptionsPanel } from "../panels/options-panel";
import { TriggerPanel } from "../panels/trigger-panel";
import { WorkflowPanel } from "../panels/workflow-panel";

type Props = {
  workflow: Workflow;
};

export const Sidebar = ({ workflow }: Props) => {
  const { node, setNode, panel, setPanel } = useWorkflow();
  const { getNodes } = useReactFlow();

  const hasTrigger = getNodes().some((node) => "isTrigger" in node.data);
  const isWorkflowPanel = panel === "workflow";

  const showBackButton = hasTrigger && !isWorkflowPanel;

  const onBack = () => {
    if (panel === "node") {
      setPanel("workflow");
      return;
    }

    if (node) {
      setNode(node);
      setPanel("node");
      return;
    }

    setPanel("node");
  };

  return (
    <div className="flex h-full w-full max-w-sm flex-col divide-y border-l bg-background">
      {showBackButton && (
        <div className="flex h-12 shrink-0 items-center px-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      )}
      <ScrollArea className="h-[calc(100vh-138px)]">
        {panel === "workflow" && <WorkflowPanel workflow={workflow} />}
        {panel === "triggers" && <TriggerPanel />}
        {panel === "node" && node?.id && <OptionsPanel workflow={workflow} />}
        {panel?.startsWith("actions") && <ActionPanel />}
      </ScrollArea>
    </div>
  );
};
