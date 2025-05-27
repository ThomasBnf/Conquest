import { Icon } from "@/components/custom/Icon";
import { Button } from "@conquest/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@conquest/ui/form";
import { Slack } from "@conquest/ui/icons/Slack";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { Switch } from "@conquest/ui/switch";
import { NodeTriggerSchema } from "@conquest/zod/schemas/node.schema";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { RefreshCcw, Trash2, type icons } from "lucide-react";
import { useForm } from "react-hook-form";
import { Description } from "../components/description";
import { NextNode } from "../components/next-node";
import { useWorkflow } from "../context/workflowContext";
import { IfElse } from "../nodes/if-else";
import { SlackMessage } from "../nodes/slack-message";
import { TagMember } from "../nodes/tag-member";
import { Task } from "../nodes/task";
import { Wait } from "../nodes/wait";
import { Webhook } from "../nodes/webhook";
import { ActionPanel } from "./action-panel";
import { FormTrigger, FormTriggerSchema } from "./schemas/form-trigger.schema";
import { TriggerPanel } from "./trigger-panel";

type Props = {
  workflow: Workflow;
};

export const OptionsPanel = ({ workflow }: Props) => {
  const { node, panel, setPanel } = useWorkflow();
  const { deleteElements } = useReactFlow();

  if (!node) return;

  const { type, icon, label } = node.data;
  const isTrigger = "isTrigger" in node.data;

  const parsedTrigger = isTrigger ? NodeTriggerSchema.parse(node.data) : null;
  const { alertByEmail } = parsedTrigger ?? {};

  const form = useForm<FormTrigger>({
    resolver: zodResolver(FormTriggerSchema),
    defaultValues: {
      alertByEmail,
    },
  });

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
                    setPanel(isTrigger ? "triggers" : "actions-change");
                  }}
                >
                  <RefreshCcw size={16} />
                </Button>
                {!isTrigger && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      onDelete();
                      setPanel("workflow");
                    }}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                )}
              </div>
            </div>
            {isTrigger && (
              <Form {...form}>
                <form>
                  <FormField
                    control={form.control}
                    name="alertByEmail"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <div className="flex items-center justify-between">
                          <FormLabel>Alert by email</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Get notified by email when this trigger runs.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
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
