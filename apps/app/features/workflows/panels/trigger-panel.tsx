import { Icon } from "@/components/custom/Icon";
import { Button } from "@conquest/ui/button";
import { Label } from "@conquest/ui/label";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { useReactFlow } from "@xyflow/react";
import type { icons } from "lucide-react";
import { v4 as uuid } from "uuid";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "./schemas/workflow-node.type";

export const TriggerPanel = () => {
  const { setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const { setNodes, updateNodeData } = useReactFlow();

  const onClick = (node: WorkflowNode) => {
    if (selected) {
      const newNode = {
        ...selected,
        data: node.data,
      };
      setSelected(newNode);
      updateNodeData(selected.id, newNode.data);
    } else {
      setSelected(node);
      setNodes((prev) => [...prev, node]);
    }
    setPanel("node");
  };

  return (
    <ScrollArea className="flex-1 p-4">
      <div>
        <Label>Triggers</Label>
        <p className="text-muted-foreground">
          Pick an event to start this workflow
        </p>
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {nodes.map((node) => {
          const { data } = node;

          return (
            <Button
              key={node.id}
              variant="outline"
              size="default"
              className="justify-start px-1.5"
              onClick={() => onClick(node)}
            >
              <div className="rounded-md border bg-background p-1">
                <Icon name={data.icon as keyof typeof icons} size={16} />
              </div>
              <p>{data.label}</p>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export const nodes = [
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "User",
      label: "Member created",
      description: "Trigger a workflow when a member is created",
      type: "member-created" as const,
      category: "members" as const,
      isTrigger: true,
    },
  },
];
