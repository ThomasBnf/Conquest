import { Button } from "@conquest/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePanel } from "../hooks/usePanel";
import { ActionPanel } from "../panels/action-panel";
import { OptionsPanel } from "../panels/options-panel";
import { TriggerPanel } from "../panels/trigger-panel";
import { WorkflowPanel } from "../panels/workflow-panel";

export const Sidebar = () => {
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
      {panel === "node" && node?.id && <OptionsPanel />}
      {panel === "workflow" && <WorkflowPanel />}
      {panel === "triggers" && <TriggerPanel />}
      {panel?.startsWith("actions") && <ActionPanel />}
    </div>
  );
};
