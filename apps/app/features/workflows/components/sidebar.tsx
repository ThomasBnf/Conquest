import { Button } from "@conquest/ui/button";
import { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { ArrowLeft } from "lucide-react";
import { usePanel } from "../hooks/usePanel";
import { ActionPanel } from "../panels/action-panel";
import { OptionsPanel } from "../panels/options-panel";
import { TriggerPanel } from "../panels/trigger-panel";
import { WorkflowPanel } from "../panels/workflow-panel";

type Props = {
  workflow: Workflow;
};

export const Sidebar = ({ workflow }: Props) => {
  const { panel, node, setPanel } = usePanel();

  const hasPanel = panel !== undefined;

  const onBack = () => {
    if (panel === "node") {
      setPanel({ panel: "workflow" });
      return;
    }

    setPanel({ panel: "node" });
  };

  return (
    <div className="h-full w-full max-w-sm divide-y border-l bg-background">
      {hasPanel && panel !== "workflow" && (
        <div className="flex h-12 shrink-0 items-center px-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      )}
      {panel === "workflow" && <WorkflowPanel workflow={workflow} />}
      {panel === "triggers" && <TriggerPanel workflow={workflow} />}
      {panel === "node" && node?.id && <OptionsPanel workflow={workflow} />}
      {panel?.startsWith("actions") && <ActionPanel />}
    </div>
  );
};
