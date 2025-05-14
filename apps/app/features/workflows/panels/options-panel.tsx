import { Icon } from "@/components/custom/Icon";
import { Button } from "@conquest/ui/button";
import { Slack } from "@conquest/ui/icons/Slack";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { type icons } from "lucide-react";
import { Description } from "../components/description";
import { NextNode } from "../components/next-node";
import { usePanel } from "../hooks/usePanel";
import { Filter } from "../nodes/filter";
import { SlackMessage } from "../nodes/slack-message";
import { Task } from "../nodes/task";
import { Wait } from "../nodes/wait";
import { Webhook } from "../nodes/webhook";
import { ActionPanel } from "./action-panel";
import { TriggerPanel } from "./trigger-panel";

type Props = {
  workflow: Workflow;
};

export const OptionsPanel = ({ workflow }: Props) => {
  const { panel, node, setPanel } = usePanel();

  if (!node) return;

  const { type, icon, label } = node.data;
  const isTrigger = "isTrigger" in node.data;

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
            {!isTrigger && <Separator />}
            {type === "filter" && <Filter />}
            {type === "slack-message" && <SlackMessage />}
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
