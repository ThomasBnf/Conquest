import { Icon } from "@/components/icons/Icon";
import { useWorkflow } from "@/context/workflowContext";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { Label } from "@conquest/ui/label";
import { cn } from "@conquest/ui/utils/cn";
import { type NodeData, NodeDataSchema } from "@conquest/zod/node.schema";
import { X, type icons } from "lucide-react";
import { useEffect, useState } from "react";

export const NextStep = () => {
  const { currentNode, onDeleteEdge, nodes, edges, setChanging, setPanel } =
    useWorkflow();
  const { icon, type, label } = currentNode?.data ?? {};
  const [nextNode, setNextNode] = useState<NodeData | undefined>();

  const nextNodeId = edges.find((e) => e.source === currentNode?.id)?.target;
  const hasNextNode = nodes.find((n) => n.id === nextNodeId);

  useEffect(() => {
    setNextNode(
      hasNextNode ? NodeDataSchema.parse(hasNextNode.data) : undefined,
    );
  }, [edges]);

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
              onClick={() => {
                onDeleteEdge();
                setPanel("action");
                setChanging(true);
              }}
              className="relative cursor-pointer z-10 flex items-center gap-2 border rounded-lg h-10 px-2 hover:bg-muted-hover transition-colors-hover"
            >
              {nextNode ? (
                <Icon
                  name={nextNode?.icon as keyof typeof icons}
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
                {nextNode?.label ?? (
                  <span className="text-muted-foreground">Select a block</span>
                )}
              </p>
              {nextNode && (
                <Button variant="outline" size="icon" className="ml-auto">
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
