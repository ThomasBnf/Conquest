import { Icon } from "@/components/custom/Icon";
import { DeleteDialog } from "@/components/custom/delete-dialog";
import { Button } from "@conquest/ui/button";
import { Slack } from "@conquest/ui/icons/Slack";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { useReactFlow } from "@xyflow/react";
import type { icons } from "lucide-react";
import { toast } from "sonner";
import { Description } from "../components/description";
import { NextStep } from "../components/next-step";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import { ListMembers } from "../nodes/list-members";
import { RecurringWorkflow } from "../nodes/recurring-workflow";
import { SlackMessage } from "../nodes/slack-message";
import { TagMember } from "../nodes/tag-member";
import { Wait } from "../nodes/wait";
import { Webhook } from "../nodes/webhook";
import { ActionPanel } from "./action-panel";
import { TriggerPanel } from "./trigger-panel";

export const OptionsPanel = () => {
  const { panel, setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const { getEdges, deleteElements } = useReactFlow();

  if (!selected) return;

  const { type, icon, label } = selected.data;
  const isTrigger = "isTrigger" in selected.data;

  const onDelete = async () => {
    deleteElements({
      nodes: [{ id: selected.id }],
      edges: getEdges().filter(
        (edge) => edge.source === selected.id || edge.target === selected.id,
      ),
    });

    setSelected(undefined);
    setPanel("workflow");
    toast.success("Node deleted");
    return;
  };

  return (
    <div className="flex h-full flex-col">
      {panel === "actions" && <ActionPanel />}
      {panel === "triggers" && <TriggerPanel />}
      {panel === "node" && (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                {icon === "Slack" ? (
                  <Slack size={44} className="rounded-md border p-2.5" />
                ) : (
                  <Icon
                    name={icon as keyof typeof icons}
                    size={44}
                    className="rounded-md border p-2.5"
                  />
                )}
                <p className="font-medium text-sm">{label}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setPanel(isTrigger ? "triggers" : "actions-change");
                }}
              >
                Change
              </Button>
            </div>
            <Description id={selected.id} />
            {type === "recurring-workflow" && <RecurringWorkflow />}
            {type === "list-members" && <ListMembers />}
            {type === "webhook" && <Webhook />}
            {type === "add-tag" && <TagMember />}
            {type === "remove-tag" && <TagMember />}
            {type === "slack-message" && <SlackMessage />}
            {type === "wait" && <Wait />}
            <Separator />
            <NextStep />
          </div>
        </ScrollArea>
      )}
      {panel === "node" && !isTrigger && (
        <div className="flex shrink-0 justify-end p-4">
          <DeleteDialog
            title="Delete Workflow"
            description="Are you sure you want to delete this workflow?"
            onConfirm={onDelete}
          />
        </div>
      )}
    </div>
  );
};
