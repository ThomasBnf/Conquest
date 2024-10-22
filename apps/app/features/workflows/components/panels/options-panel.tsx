import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { NodeDataSchema } from "@conquest/zod/node.schema";
import { DeleteDialog } from "components/custom/delete-dialog";
import { Icon } from "components/icons/Icon";
import { useWorkflow } from "context/workflowContext";
import { ArrowLeft, type icons } from "lucide-react";
import { Description } from "../description";
import { ListRecordsOptions } from "../nodes/list-records/listRecords.options";
import { RecurringScheduleOptions } from "../nodes/recurring-schedule/recurring.options";
import { TagContactOptions } from "../nodes/tag-contact/tag-contact.options";
import { WebhookOptions } from "../nodes/webhook/webhook.options";

export const OptionsPanel = () => {
  const { currentNode, setCurrentNode, onDeleteNode } = useWorkflow();
  const data = NodeDataSchema.parse(currentNode?.data);
  const { type } = data;

  return (
    <div className="flex flex-1 flex-col divide-y">
      <div className="flex h-12 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentNode(undefined)}
        >
          <ArrowLeft size={16} />
        </Button>
      </div>
      <div className="flex flex-col gap-2 p-6">
        <div className="mb-2 flex items-center gap-2">
          <Icon
            name={data.icon as keyof typeof icons}
            size={24}
            className="text-muted-foreground"
          />
          <p className="font-medium">{data.label}</p>
          <div className="space-y1">
            <Badge
              variant="secondary"
              className="ml-auto font-normal capitalize text-muted-foreground"
            >
              {data.category}
            </Badge>
          </div>
        </div>
        <Description />
        {type === "trigger-recurring-schedule" && <RecurringScheduleOptions />}
        {type === "list-records" && <ListRecordsOptions />}
        {type === "webhook" && <WebhookOptions />}
        {type === "add-tag" && <TagContactOptions />}
        {type === "remove-tag" && <TagContactOptions />}
      </div>
      <div className="mt-auto flex justify-end gap-2 p-4">
        <DeleteDialog
          title="Delete node"
          description="Are you sure you want to delete this node?"
          onConfirm={onDeleteNode}
        />
      </div>
    </div>
  );
};
