import { Icon } from "@/components/custom/Icon";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { Slack } from "@conquest/ui/icons/Slack";
import { Label } from "@conquest/ui/label";
import { useReactFlow } from "@xyflow/react";
import { X, type icons } from "lucide-react";
import { useNode } from "../hooks/useNode";
import { usePanel } from "../hooks/usePanel";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";

export const NextNode = () => {
  const { setPanel } = usePanel();
  const { node: selectedNode } = useNode();
  const { getNodes, getEdges, deleteElements } = useReactFlow();
  const { icon, label, type } = selectedNode?.data ?? {};

  const nodes = getNodes();
  const edges = getEdges();

  const isIfElse = type === "if-else";

  const getNextNode = (condition: "true" | "false" | undefined) => {
    return nodes.find((node) =>
      edges.find(
        (edge) =>
          edge.source === selectedNode?.id &&
          edge.target === node.id &&
          (isIfElse ? edge.data?.condition === condition : true),
      ),
    ) as WorkflowNode | undefined;
  };

  const trueNode = getNextNode("true");
  const falseNode = getNextNode("false");

  const onDeleteNode = (condition?: "true" | "false") => {
    deleteElements({
      edges: edges.filter(
        (edge) =>
          edge.source === selectedNode?.id &&
          (!condition || edge.data?.condition === condition),
      ),
    });
  };

  const renderNodeButton = (
    node: WorkflowNode | undefined,
    condition: "true" | "false",
  ) => (
    <div
      className="relative z-10 flex h-10 cursor-pointer items-center gap-2 rounded-md border px-2 transition-colors-hover hover:bg-muted-hover"
      onClick={() => setPanel({ panel: "actions", condition })}
    >
      {node ? (
        node.data.icon === "Slack" ? (
          <Slack size={24} className="rounded-md border p-1" />
        ) : (
          <Icon
            name={node.data.icon as keyof typeof icons}
            size={24}
            className="rounded-md border p-1"
          />
        )
      ) : (
        <Icon name="Plus" size={24} className="rounded-md border p-1" />
      )}
      <p>
        {node?.data.label ?? (
          <span className="text-muted-foreground">Select a node</span>
        )}
      </p>
      {node && (
        <Button
          variant="outline"
          size="icon_sm"
          className="ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNode(condition);
          }}
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <Label>Next node</Label>
      <div className="relative mt-2">
        <div className="relative z-10 flex h-10 items-center gap-2 rounded-md border bg-muted px-2">
          {icon === "Slack" ? (
            <Slack size={24} className="rounded-md border bg-background p-1" />
          ) : (
            <Icon
              name={icon as keyof typeof icons}
              size={24}
              className="rounded-md border bg-background p-1"
            />
          )}
          <p>{label}</p>
        </div>
        <div className="relative mt-2 flex">
          <div className="-mt-8 absolute ml-4 h-[93px] w-5 rounded-l-lg border-bl-lg border-b border-l" />
          {isIfElse && (
            <div className="-mt-8 absolute ml-4 h-[181px] w-5 rounded-l-lg border-bl-lg border-b border-l" />
          )}
          <div className="mt-2 ml-9 w-full space-y-1.5">
            {isIfElse ? (
              <div className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <Badge variant="secondary">is True</Badge>
                  {renderNodeButton(trueNode, "true")}
                </div>
                <div className="space-y-1.5">
                  <Badge variant="secondary">is False</Badge>
                  {renderNodeButton(falseNode, "false")}
                </div>
              </div>
            ) : (
              <>
                <Badge variant="secondary">Next node</Badge>
                {renderNodeButton(trueNode, "true")}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
