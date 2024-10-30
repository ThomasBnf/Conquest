import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { cn } from "@conquest/ui/utils/cn";
import { NodeDataSchema } from "@conquest/zod/node.schema";
import { DeleteDialog } from "components/custom/delete-dialog";
import { Icon } from "components/icons/Icon";
import { useWorkflow } from "context/workflowContext";
import { ArrowLeft, type icons } from "lucide-react";
import { Description } from "../description";
import { ListRecordsOptions } from "../nodes/list-records/listRecords.options";
import { RecurringScheduleOptions } from "../nodes/recurring-schedule/recurring.options";
import { TagMemberOptions } from "../nodes/tag-member/tag-member.options";
import { WebhookOptions } from "../nodes/webhook/webhook.options";
import { TriggerPanel } from "./trigger-panel";

export const OptionsPanel = () => {
  const {
    currentNode,
    setCurrentNode,
    setPanel,
    onDeleteNode,
    changing,
    setChanging,
  } = useWorkflow();
  const data = NodeDataSchema.parse(currentNode?.data);
  const { type } = data;

  const onChangeNode = () => {
    setChanging(true);
  };

  return (
    <div className="flex flex-col divide-y h-full">
      <div className="flex h-12 items-center px-4 shrink-0">
        <Button
          variant="ghost"
          onClick={() => {
            setCurrentNode(undefined);
            setPanel("workflow");
          }}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>
      {changing ? (
        <TriggerPanel />
      ) : (
        <>
          <ScrollArea className="flex-grow h-[calc(100vh-10rem)]">
            <div className="flex flex-col gap-4 p-6">
              <div className="flex justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon
                    name={data.icon as keyof typeof icons}
                    size={24}
                    className={cn(
                      "border rounded-md size-11 p-1.5",
                      type.startsWith("trigger") &&
                        "border-blue-200 bg-blue-100 text-blue-500",
                    )}
                  />
                  <div className="space-y-1">
                    <Badge variant="secondary">{data.category}</Badge>
                    <p className="font-medium">{data.label}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={onChangeNode}>
                  Change
                </Button>
              </div>
              <Description />
              {type === "trigger-recurring-schedule" && (
                <RecurringScheduleOptions />
              )}
              {type === "list-records" && <ListRecordsOptions />}
              {type === "webhook" && <WebhookOptions />}
              {type === "add-tag" && <TagMemberOptions />}
              {type === "remove-tag" && <TagMemberOptions />}
            </div>
          </ScrollArea>
          <div className="mt-auto flex justify-end gap-2 p-4 shrink-0">
            <DeleteDialog
              title="Delete node"
              description="Are you sure you want to delete this node?"
              onConfirm={onDeleteNode}
            />
          </div>
        </>
      )}
    </div>
  );
};
