import { Icon } from "@/components/custom/Icon";
import { Button } from "@conquest/ui/button";
import { Slack } from "@conquest/ui/icons/Slack";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { useReactFlow } from "@xyflow/react";
import { RefreshCcw, Trash2, type icons } from "lucide-react";
import { Description } from "../components/description";
import { NextNode } from "../components/next-node";
import { useNode } from "../hooks/useNode";
import { usePanel } from "../hooks/usePanel";
import { IfElse } from "../nodes/if-else";
import { SlackMessage } from "../nodes/slack-message";
import { TagMember } from "../nodes/tag-member";
import { Task } from "../nodes/task";
import { Wait } from "../nodes/wait";
import { Webhook } from "../nodes/webhook";
import { ActionPanel } from "./action-panel";
import { TriggerPanel } from "./trigger-panel";

type Props = {
  workflow: Workflow;
};

export const OptionsPanel = ({ workflow }: Props) => {
  const { node } = useNode();
  const { panel, setPanel } = usePanel();
  const { deleteElements } = useReactFlow();

  if (!node) return;

  const { type, icon, label } = node.data;
  const isTrigger = "isTrigger" in node.data;

  const onDelete = () => {
    if (!node) return;

    deleteElements({
      nodes: [node],
    });
  };

  return (
    <>
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
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setPanel({
                      panel: isTrigger ? "triggers" : "actions-change",
                    });
                  }}
                >
                  <RefreshCcw size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    onDelete();
                    setPanel({ panel: "workflow" });
                  }}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            </div>
            <Description id={node.id} />
            {!isTrigger && <Separator />}
            {type === "if-else" && <IfElse />}
            {type === "slack-message" && <SlackMessage />}
            {type === "add-tag" && <TagMember />}
            {type === "remove-tag" && <TagMember />}
            {type === "task" && <Task />}
            {type === "wait" && <Wait />}
            {type === "webhook" && <Webhook />}
            <Separator />
            <NextNode />
          </div>
        </ScrollArea>
      )}
    </>
  );
};
