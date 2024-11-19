import { Button } from "@conquest/ui/button";
import { Label } from "@conquest/ui/label";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { useReactFlow } from "@xyflow/react";
import { Icon } from "components/icons/Icon";
import cuid from "cuid";
import type { icons } from "lucide-react";
import { useChanging } from "../hooks/useChanging";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "./types/workflow-node.type";

export const TriggerPanel = () => {
  const { setPanel } = usePanel();
  const { selected, setSelected } = useSelected();
  const { isChanging, setIsChanging } = useChanging();
  const { setNodes, updateNodeData } = useReactFlow();

  const onClick = (node: WorkflowNode) => {
    if (isChanging && selected) {
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
    setIsChanging(false);
  };

  return (
    <ScrollArea className="flex-1 p-6">
      <div>
        <Label>Triggers</Label>
        <p className="text-muted-foreground">
          Pick an event to start this workflow
        </p>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {nodes.categories.map((category) => {
          return (
            <div key={category.label} className="mt-2">
              <Label>{category.label}</Label>
              <div className="mt-1 flex flex-col gap-1">
                {category.nodes.map((node) => {
                  const { data } = node;

                  return (
                    <Button
                      key={node.id}
                      variant="outline"
                      size="default"
                      className="px-2"
                      classNameSpan="justify-start"
                      onClick={() => onClick(node)}
                    >
                      <div className="border rounded-md bg-blue-100 border-blue-200 p-1">
                        <Icon
                          name={data.icon as keyof typeof icons}
                          size={15}
                          className="text-blue-500"
                        />
                      </div>
                      <p className="font-medium">{data.label}</p>
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export const nodes: {
  categories: {
    label: string;
    nodes: WorkflowNode[];
  }[];
} = {
  categories: [
    {
      label: "Members",
      nodes: [
        {
          id: cuid(),
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            icon: "User",
            label: "Member created",
            description: "Trigger a workflow when a member is created",
            type: "member-created",
            category: "members",
            isTrigger: true,
          },
        },
      ],
    },
    {
      label: "Utilities",
      nodes: [
        {
          id: cuid(),
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            icon: "Calendar",
            label: "Recurring Workflow",
            description: "Trigger a recurring workflow",
            type: "recurring-workflow",
            category: "utilities",
            frequency: "daily",
            repeat_on: ["monday"],
            time: "06:00",
            isTrigger: true,
          },
        },
        {
          id: cuid(),
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            icon: "MousePointerClick",
            label: "Manual run",
            description: "Trigger a workflow manually",
            type: "manual-run",
            category: "utilities",
            isTrigger: true,
          },
        },
      ],
    },
  ],
};
