import { DeleteDialog } from "@/components/custom/delete-dialog";
import { Icon } from "@/components/icons/Icon";
import { Slack } from "@/components/icons/Slack";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { useReactFlow } from "@xyflow/react";
import { ArrowLeft, type icons } from "lucide-react";
import { toast } from "sonner";
import { Description } from "../components/description";
import { NextStep } from "../components/next-step";
import { useAdding } from "../hooks/useAdding";
import { useChanging } from "../hooks/useChanging";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import { FilterOptions } from "../nodes/list-members/filter.options";
import { RecurringWorkflowOptions } from "../nodes/recurring-workflow";
import { SlackMessageOptions } from "../nodes/slack-message";
import { TagMemberOptions } from "../nodes/tag-member";
import { WaitOptions } from "../nodes/wait";
import { WebhookOptions } from "../nodes/webhook";
import { ActionPanel } from "./action-panel";
import { TriggerPanel } from "./trigger-panel";

export const OptionsPanel = () => {
  const { panel, setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const { isAdding } = useAdding();
  const { isChanging, setIsChanging } = useChanging();
  const { getEdges, deleteElements } = useReactFlow();

  if (!selected) return;

  const { type, icon, category, label } = selected.data;
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
    return toast.success("Step deleted");
  };

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-12 shrink-0 items-center px-4">
        <Button
          variant="ghost"
          onClick={() => {
            if (isChanging) {
              setIsChanging(false);
              setPanel("node");
              return;
            }
            setSelected(undefined);
            setPanel("workflow");
          }}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>
      {(isChanging || isAdding) && panel === "actions" && <ActionPanel />}
      {(isChanging || isAdding) && panel === "triggers" && <TriggerPanel />}
      {!isChanging && panel === "node" && (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-6">
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
                <div className="space-y-1">
                  <Badge variant="secondary">{category}</Badge>
                  <p className="font-medium">{label}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setPanel(isTrigger ? "triggers" : "actions");
                  setIsChanging(true);
                }}
              >
                Change
              </Button>
            </div>
            <Description id={selected.id} />
            {type === "recurring-workflow" && <RecurringWorkflowOptions />}
            {type === "list-members" && <FilterOptions />}
            {type === "webhook" && <WebhookOptions />}
            {type === "add-tag" && <TagMemberOptions />}
            {type === "remove-tag" && <TagMemberOptions />}
            {type === "slack-message" && <SlackMessageOptions />}
            {type === "wait" && <WaitOptions />}
            <Separator />
            <NextStep />
          </div>
        </ScrollArea>
      )}
      {!isChanging && !isTrigger && !isAdding && (
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
