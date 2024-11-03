import { Badge } from "@conquest/ui/badge";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Icon } from "components/icons/Icon";
import { Target, type icons } from "lucide-react";
import { useMemo } from "react";
import { useChanging } from "../hooks/useChanging";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "../panels/types/node-data";
import { CustomHandle } from "./custom-handle";

export const CustomNode = ({ ...props }: NodeProps<WorkflowNode>) => {
  const { setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const { setIsChanging } = useChanging();
  const { getNode } = useReactFlow();

  const node = getNode(props.id) as WorkflowNode | undefined;

  if (!node) return;

  const { category, icon, label, description } = node.data;
  const isTrigger = useMemo(() => "isTrigger" in node.data, [node]);

  return (
    <div className="relative">
      {isTrigger && (
        <div
          className={cn(
            "absolute -top-[24px] flex h-6 items-center gap-1 rounded-t-lg border-x border-t bg-muted px-1.5 text-muted-foreground",
            node?.id === props.id && "bg-muted text-main-500 ",
          )}
        >
          <Target size={14} />
          <p className="text-xs leading-none">Trigger</p>
        </div>
      )}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        onClick={() => {
          setSelected(node);
          setPanel("node");
          setIsChanging(false);
        }}
        className={cn(
          "relative flex w-80 flex-1 flex-col border bg-background p-3",
          isTrigger ? "rounded-b-lg rounded-tr-lg" : "rounded-lg",
          selected?.id === node.id && "border-main-500 ring-2 ring-ring",
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "rounded-lg border p-1",
              category === "utilities" &&
                "border-blue-200 bg-blue-100 text-blue-500",
              category === "mutations" &&
                "border-green-200 bg-green-100 text-green-500",
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
      {/* {!hasEdge && (
        <>
          <div className="h-7 w-px bg-border absolute -bottom-9 left-1/2 -translate-x-1/2" />
          <Button
            size="icon"
            className="absolute -bottom-16 left-1/2 -translate-x-1/2"
            onClick={() => {
              setSelected(node);
              setPanel("actions");
            }}
          >
            <Plus size={16} />
          </Button>
        </>
      )} */}
    </div>
  );
};
