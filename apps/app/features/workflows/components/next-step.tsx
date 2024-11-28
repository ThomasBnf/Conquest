import { Icon } from "@/components/icons/Icon";
import { Slack } from "@/components/icons/Slack";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { Label } from "@conquest/ui/label";
import { useReactFlow } from "@xyflow/react";
import { X, type icons } from "lucide-react";
import { useAdding } from "../hooks/useAdding";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "../panels/types/workflow-node.type";

export const NextStep = () => {
  const { setPanel } = usePanel();
  const { selected } = useSelected();
  const { setIsAdding } = useAdding();

  const { getNodes, getEdges, deleteElements } = useReactFlow();
  const { icon, label } = selected?.data ?? {};

  const nodes = getNodes();
  const edges = getEdges();
  const nextNode = nodes.find((node) =>
    edges.find(
      (edge) => edge.source === selected?.id && edge.target === node.id,
    ),
  ) as WorkflowNode | undefined;

  const isTrigger = "isTrigger" in (selected?.data ?? {});
  const isNextNodeTrigger = "isTrigger" in (nextNode?.data ?? {});
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
        <div className="relative z-10 flex h-10 items-center gap-2 rounded-md border bg-muted-hover px-2">
          {icon === "Slack" ? (
            <Slack size={24} className="rounded-md border p-1" />
          ) : (
            <Icon
              name={icon as keyof typeof icons}
              size={24}
              className="rounded-md border p-1"
            />
          )}
          <p>{label}</p>
        </div>
        <div className="mt-2 flex">
          <div className="border-bl-lg -mt-8 ml-4 h-20 w-5 rounded-l-lg border-b border-l" />
          <div className="w-full space-y-1.5">
            <Badge variant="secondary">Next step</Badge>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className="transition-colors-hover relative z-10 flex h-10 cursor-pointer items-center gap-2 rounded-md border px-2 hover:bg-muted-hover"
              onClick={() => {
                setPanel("actions");
                setIsAdding(true);
              }}
            >
              {nextNode ? (
                nextNode.data.icon === "Slack" ? (
                  <Slack size={24} className="rounded-md border p-1" />
                ) : (
                  <Icon
                    name={nextNode?.data.icon as keyof typeof icons}
                    size={24}
                    className="rounded-md border p-1"
                  />
                )
              ) : (
                <Icon name="Plus" size={24} className="rounded-md border p-1" />
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
                  <X size={15} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
