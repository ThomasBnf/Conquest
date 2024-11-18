import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Icon } from "components/icons/Icon";
import { Plus, Target, type icons } from "lucide-react";
import { useMemo } from "react";
import { useAdding } from "../hooks/useAdding";
import { useChanging } from "../hooks/useChanging";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "../panels/types/workflow-node.type";
import { CustomHandle } from "./custom-handle";

type Props = NodeProps<WorkflowNode> & {
  hasEdges: WorkflowNode[];
};

export const CustomNode = ({ hasEdges, ...props }: Props) => {
  const { setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const { setIsAdding } = useAdding();
  const { setIsChanging } = useChanging();
  const { getNode } = useReactFlow();

  const node = getNode(props.id) as WorkflowNode | undefined;

  if (!node) return;

  const { category, icon, label, description } = node.data;
  const isTrigger = useMemo(() => "isTrigger" in node.data, [node]);

  const hasEdge = useMemo(
    () => hasEdges.find((edge) => edge.id === node.id),
    [hasEdges, props],
  );

  return (
    <div className="relative">
      {isTrigger && (
        <div
          className={cn(
            "absolute -top-[24px] flex h-6 items-center gap-1 rounded-t-lg border-x border-t bg-muted px-1.5 text-muted-foreground",
            node?.id === props.id && "bg-muted text-main-500 ",
          )}
        >
          <Target size={15} />
          <p className="text-xs leading-none">Trigger</p>
        </div>
      )}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        onClick={() => {
          setPanel("node");
          setIsChanging(false);
          setSelected(node);
        }}
        className={cn(
          "relative flex w-80 flex-1 flex-col border bg-background p-3",
          isTrigger ? "rounded-b-lg rounded-tr-lg" : "rounded-md",
          selected?.id === node.id && "border-main-500 ring-2 ring-ring",
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "rounded-md border p-1",
              isTrigger
                ? "border-blue-300 bg-blue-100 text-blue-500"
                : "border-green-300 bg-green-100 text-green-500",
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
      {!hasEdge && (
        <>
          <div className="h-7 w-px bg-border absolute -bottom-9 left-1/2 -translate-x-1/2" />
          <Button
            size="icon"
            className="absolute -bottom-16 left-1/2 -translate-x-1/2"
            onClick={() => {
              setPanel("actions");
              setIsAdding(true);
              setSelected(node);
            }}
          >
            <Plus size={16} />
          </Button>
        </>
      )}
    </div>
  );
};
