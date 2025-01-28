import { Slack } from "@/components/icons/Slack";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Icon } from "components/icons/Icon";
import { Plus, Target, type icons } from "lucide-react";
import { useMemo } from "react";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";
import { CustomHandle } from "./custom-handle";

type Props = NodeProps<WorkflowNode> & {
  hasEdges: WorkflowNode[];
};

export const CustomNode = ({ hasEdges, ...props }: Props) => {
  const { setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const { getNode } = useReactFlow();

  const node = getNode(props.id) as WorkflowNode | undefined;

  if (!node) return;

  const { category, icon, label, description } = node.data;
  const isTrigger = useMemo(() => "isTrigger" in node.data, [node]);
  const isLoop = useMemo(() => node.data.type === "loop", [node]);

  const hasEdge = useMemo(
    () => hasEdges.find((edge) => edge.id === node.id),
    [hasEdges, props],
  );

  return (
    <div className="relative">
      {isTrigger && (
        <div
          className={cn(
            "-top-[24px] absolute flex h-6 items-center gap-1 rounded-t-lg border-x border-t bg-muted px-1.5 text-muted-foreground",
            node?.id === props.id && "bg-muted text-main-500",
          )}
        >
          <Target size={16} />
          <p className="text-xs leading-none">Trigger</p>
        </div>
      )}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        onClick={() => {
          setPanel("node");
          setSelected(node);
        }}
        className={cn(
          "relative flex w-80 flex-1 flex-col border bg-background p-3",
          isTrigger ? "rounded-b-lg rounded-tr-lg" : "rounded-md",
          selected?.id === node.id && "border-main-500 ring-2 ring-ring",
        )}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-md border p-1">
            {icon === "Slack" ? (
              <Slack size={16} />
            ) : (
              <Icon name={icon as keyof typeof icons} size={16} />
            )}
          </div>
          <p className="font-medium">{label}</p>
          <Badge variant="secondary" className="ml-auto">
            {category}
          </Badge>
        </div>
        <Separator className="my-3" />
        <p className="line-clamp-1 text-muted-foreground">
          {description === "" ? "No description" : description}
        </p>
        {!isTrigger && <CustomHandle position={Position.Top} type="target" />}
        <CustomHandle position={Position.Bottom} type="source" />
      </div>
      {!hasEdge && (
        <>
          <div className="-bottom-9 -translate-x-1/2 absolute left-1/2 h-7 w-px bg-border" />
          <Button
            size="icon"
            className="-bottom-16 -translate-x-1/2 absolute left-1/2"
            onClick={() => {
              setPanel("actions");
              setSelected(node);
            }}
          >
            <Plus size={16} />
          </Button>
        </>
      )}
      {isLoop && (
        <div className="-z-10 -translate-x-1/2 absolute top-8 left-1/2 h-48 w-full">
          <div className="-translate-x-1/2 absolute left-1/2 flex h-48 w-[calc(100%+40px)] items-center justify-center rounded-lg border border-dashed">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPanel("actions");
                setSelected(node);
              }}
            >
              <Plus size={20} className="rounded border p-0.5" />
              Select first step
            </Button>
          </div>
          <div className="-bottom-9 -translate-x-1/2 absolute left-1/2 h-7 w-px bg-border" />
          <CustomHandle position={Position.Bottom} type="source" />
          <Button
            size="icon"
            className="-bottom-16 -translate-x-1/2 absolute left-1/2"
            onClick={() => {
              setPanel("actions");
              setSelected(node);
            }}
          >
            <Plus size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};
