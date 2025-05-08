import { Icon } from "@/components/custom/Icon";
import { DeleteDialog } from "@/components/custom/delete-dialog";
import { Button } from "@conquest/ui/button";
import { Slack } from "@conquest/ui/icons/Slack";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { useReactFlow } from "@xyflow/react";
import type { icons } from "lucide-react";
import { toast } from "sonner";
import { NextNode } from "../components/NextNode";
import { Description } from "../components/description";
import { usePanel } from "../hooks/usePanel";
import { SlackMessage } from "../nodes/slack-message";
import { Wait } from "../nodes/wait";
import { ActionPanel } from "./action-panel";
import { TriggerPanel } from "./trigger-panel";

type Props = {
  workflow: Workflow;
};

export const OptionsPanel = ({ workflow }: Props) => {
  const { panel, node, setPanel } = usePanel();
  const { getEdges, deleteElements } = useReactFlow();

  if (!node) return;

  const { type, icon, label } = node.data;
  const isTrigger = "isTrigger" in node.data;

  const onDelete = async () => {
    deleteElements({
      nodes: [{ id: node.id }],
      edges: getEdges().filter(
        (edge) => edge.source === node.id || edge.target === node.id,
      ),
    });

    setPanel({ panel: "workflow", node: undefined });
    toast.success("Node deleted");
    return;
  };

  return (
    <div className="flex h-full flex-col">
      {panel === "actions" && <ActionPanel />}
      {panel === "triggers" && <TriggerPanel workflow={workflow} />}
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
                  setPanel({
                    panel: isTrigger ? "triggers" : "actions-change",
                    node: node,
                  });
                }}
              >
                Change
              </Button>
            </div>
            <Description id={node.id} />
            {type === "slack-message" && <SlackMessage />}
            {type === "wait" && <Wait />}
            <Separator />
            <NextNode />
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
