import { useWorkflow } from "@/context/workflowContext";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import { NodeDataSchema } from "@conquest/zod/node.schema";
import { type NodeProps, Position } from "@xyflow/react";
import { Icon } from "components/icons/Icon";
import { Plus, Target, type icons } from "lucide-react";
import { CustomHandle } from "./custom-handle";

type Props = {
  props: NodeProps;
};

export const CustomNode = ({ props }: Props) => {
  const { currentNode, setCurrentNode, setPanel, nodes } = useWorkflow();

  const data = NodeDataSchema.parse(props.data);
  const { type, category, icon, label, description } = data;

  const isTrigger = type.startsWith("trigger");
  const isLastNode = nodes.at(-1)?.id === props.id;

  return (
    <div className="relative">
      {isTrigger && (
        <div
          className={cn(
            "absolute -top-[24px] flex h-6 items-center gap-1 rounded-t-md border-x border-t bg-muted px-1 text-muted-foreground",
            currentNode?.id === props.id && "bg-muted text-main-500 ",
          )}
        >
          <Target size={14} />
          <p className="text-xs leading-none">Trigger</p>
        </div>
      )}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        onClick={() => {
          setCurrentNode({
            id: props.id,
            position: {
              x: props.positionAbsoluteX,
              y: props.positionAbsoluteY,
            },
            type: "custom",
            data,
          });
        }}
        className={cn(
          "relative flex w-80 flex-1 flex-col border bg-background p-3",
          isTrigger ? "rounded-b-md rounded-tr-md" : "rounded-lg",
          currentNode?.id === props.id && "border-main-500",
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "rounded-lg border p-1",
              category === "utilities" &&
                "border-blue-200 bg-blue-100 text-blue-500",
              category === "records" &&
                "border-yellow-200 bg-yellow-100 text-yellow-500",
            )}
          >
            <Icon name={icon as keyof typeof icons} size={16} />
          </div>
          <p className="font-medium">{label}</p>
          <Badge variant="secondary" className="ml-auto">
            {category}
          </Badge>
        </div>
        <Separator className="my-3" />
        <p className="text-balance text-muted-foreground">
          {description === "" ? "No description" : description}
        </p>
        {!isTrigger && <CustomHandle position={Position.Top} type="target" />}
        <CustomHandle position={Position.Bottom} type="source" />
      </div>
      {isLastNode && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          onClick={() => {
            setPanel("action");
            setCurrentNode(undefined);
          }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center justify-center py-1">
            <div className="h-2 w-px bg-border" />
          </div>
          <Button size="icon">
            <Plus size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};
