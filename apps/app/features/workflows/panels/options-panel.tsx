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
import { TagMemberOptions } from "../nodes/tag-member/tag-member.options";
import { WebhookOptions } from "../nodes/webhook/webhook.options";

export const OptionsPanel = () => {
  const { currentNode, setCurrentNode, setPanel, onDeleteNode } = useWorkflow();
  const data = NodeDataSchema.parse(currentNode?.data);
  const { type } = data;

  return (
    <div className="flex flex-1 flex-col divide-y">
      <div className="flex h-12 items-center px-4">
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
      <div className="flex flex-col gap-4 p-6">
        <div className="mb-2 flex items-center gap-2">
          <Icon
            name={data.icon as keyof typeof icons}
            size={24}
            className="text-muted-foreground"
          />
          <p className="font-medium">{data.label}</p>
          <div className="space-y1">
            <Badge variant="secondary">{data.category}</Badge>
          </div>
        </div>
        <Description />
        {type === "trigger-recurring-schedule" && <RecurringScheduleOptions />}
        {type === "list-records" && <ListRecordsOptions />}
        {type === "webhook" && <WebhookOptions />}
        {type === "add-tag" && <TagMemberOptions />}
        {type === "remove-tag" && <TagMemberOptions />}
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
