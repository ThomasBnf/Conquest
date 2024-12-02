import { useAdding } from "../hooks/useAdding";
import { useChanging } from "../hooks/useChanging";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import { ActionPanel } from "../panels/action-panel";
import { OptionsPanel } from "../panels/options-panel";
import { TriggerPanel } from "../panels/trigger-panel";
import { WorkflowPanel } from "../panels/workflow-panel";

export const Sidebar = () => {
  const { panel } = usePanel();
  const { selected } = useSelected();
  const { isChanging } = useChanging();
  const { isAdding } = useAdding();

  return (
    <div className="h-full w-full max-w-md border-l bg-background">
      {!isAdding && selected && <OptionsPanel />}
      {!isChanging && panel === "workflow" && <WorkflowPanel />}
      {!isChanging && panel === "triggers" && <TriggerPanel />}
      {!isChanging && panel === "actions" && <ActionPanel />}
    </div>
  );
};
