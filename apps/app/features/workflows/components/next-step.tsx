import { Icon } from "@/components/icons/Icon";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { Label } from "@conquest/ui/label";
import { cn } from "@conquest/ui/utils/cn";
import { useReactFlow } from "@xyflow/react";
import { X, type icons } from "lucide-react";
import { useAdding } from "../hooks/useAdding";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "../panels/types/node-data";

export const NextStep = () => {
  const { setPanel } = usePanel();
  const { selected } = useSelected();
  const { setIsAdding } = useAdding();

  const { getNodes, getEdges, deleteElements } = useReactFlow();
  const { icon, type, label } = selected?.data ?? {};

  const nodes = getNodes();
  const edges = getEdges();
  const nextNode = nodes.find((node) =>
    edges.find(
      (edge) => edge.source === selected?.id && edge.target === node.id,
    ),
  ) as WorkflowNode | undefined;

  const { label: nextNodeLabel } = nextNode?.data ?? {};

  const onDeleteNode = () => {
    deleteElements({
      edges: edges.filter((edge) => edge.source === selected?.id),
    });
  };

  return (
    <div>
      <Label>Next step</Label>
      <p className="text-muted-foreground">
        Add the next block in the workflow
      </p>
      <div className="relative mt-2">
        <div className="relative z-10 flex items-center gap-2 border rounded-lg h-10 px-2 bg-muted">
          <Icon
            name={icon as keyof typeof icons}
            size={24}
            className={cn(
              "border rounded-lg p-1",
              type?.startsWith("trigger") &&
                "border-blue-200 bg-blue-100 text-blue-500",
            )}
          />
          <p>{label}</p>
        </div>
        <div className="flex mt-2">
          <div className="w-5 h-20  border-l border-bl-lg border-b rounded-l-lg ml-4 -mt-8" />
          <div className="space-y-1.5 w-full">
            <Badge variant="secondary">Next step</Badge>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className="relative cursor-pointer z-10 flex items-center gap-2 border rounded-lg h-10 px-2 hover:bg-muted-hover transition-colors-hover"
              onClick={() => {
                setPanel("actions");
                setIsAdding(true);
              }}
            >
              {nextNode ? (
                <Icon
                  name={nextNode?.data.icon as keyof typeof icons}
                  size={24}
                  className={cn(
                    "border rounded-lg p-1",
                    nextNode?.type?.startsWith("trigger") &&
                      "border-blue-200 bg-blue-100 text-blue-500",
                  )}
                />
              ) : (
                <Icon name="Plus" size={24} className="border rounded-lg p-1" />
              )}
              <p>
                {nextNodeLabel ?? (
                  <span className="text-muted-foreground">Select a block</span>
                )}
              </p>
              {nextNode && (
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto"
                  onClick={onDeleteNode}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
