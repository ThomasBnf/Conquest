import { Icon } from "@/components/custom/Icon";
import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { Slack } from "@conquest/ui/icons/Slack";
import { Separator } from "@conquest/ui/separator";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Target, type icons } from "lucide-react";
import { useMemo } from "react";
import { useWorkflow } from "../context/workflowContext";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";
import { CustomHandle } from "./custom-handle";

type Props = NodeProps<WorkflowNode>;

export const CustomNode = ({ ...props }: Props) => {
  const { node: selectedNode } = useWorkflow();
  const { getNode } = useReactFlow();

  const node = getNode(props.id) as WorkflowNode;

  const { icon, label, description } = node.data;
  const isTrigger = useMemo(() => "isTrigger" in node.data, [node]);

  const isCompleted = useMemo(
    () => "status" in node.data && node.data.status === "COMPLETED",
    [node],
  );
  const hasError = useMemo(
    () => "status" in node.data && node.data.status === "FAILED",
    [node],
  );

  return (
    <div className="relative">
      {isTrigger && (
        <div
          className={cn(
            "-top-[24px] absolute flex h-6 items-center gap-1 rounded-t-lg border-x border-t bg-muted px-1.5 text-muted-foreground",
            node?.id === props.id && "bg-muted text-main-400",
          )}
        >
          <Target size={16} />
          <p className="text-xs leading-none">Trigger</p>
        </div>
      )}
      <div
        className={cn(
          "relative flex w-80 flex-1 flex-col border bg-background p-3",
          isTrigger ? "rounded-b-lg rounded-tr-lg" : "rounded-md",
          selectedNode?.id === props.id && "border-main-400 ring-2 ring-ring",
        )}
      >
        {hasError && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Failed
          </Badge>
        )}
        {isCompleted && (
          <Badge variant="success" className="absolute top-2 right-2">
            {isTrigger ? "Triggered" : "Completed"}
          </Badge>
        )}
        <div className="flex items-center gap-2">
          <div className="rounded-md border p-1">
            {icon === "Slack" ? (
              <Slack size={16} />
            ) : (
              <Icon name={icon as keyof typeof icons} size={16} />
            )}
          </div>
          <p className="font-medium">{label}</p>
        </div>
        <Separator className="my-3" />
        <p className="line-clamp-1 text-muted-foreground">
          {description === "" ? "No description" : description}
        </p>
        {!isTrigger && <CustomHandle position={Position.Top} type="target" />}
        <CustomHandle position={Position.Bottom} type="source" />
      </div>
    </div>
  );
};
