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
    <div className="flex flex-col w-full h-full max-w-sm border-l divide-y bg-background">
      {showBackButton && (
        <div className="flex items-center h-12 px-2 shrink-0">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      )}
      <ScrollArea className="h-[calc(100vh-138px)]">
        {panel === "workflow" && <WorkflowPanel workflow={workflow} />}
        {panel === "triggers" && <TriggerPanel workflow={workflow} />}
        {panel === "node" && node?.id && <OptionsPanel workflow={workflow} />}
        {panel?.startsWith("actions") && <ActionPanel />}
      </ScrollArea>
    </div>
  );
};
