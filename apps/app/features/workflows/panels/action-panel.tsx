import { Icon } from "@/components/custom/Icon";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Slack } from "@conquest/ui/icons/Slack";
import { Label } from "@conquest/ui/label";
import { Separator } from "@conquest/ui/separator";
import { useReactFlow } from "@xyflow/react";
import type { icons } from "lucide-react";
import { v4 as uuid } from "uuid";
import { usePanel } from "../hooks/usePanel";
import type { WorkflowNode } from "./schemas/workflow-node.type";

export const ActionPanel = () => {
  const { panel, node: selectedNode, setPanel } = usePanel();
  const { addNodes, addEdges, updateNodeData } = useReactFlow();

  const onSelect = (node: WorkflowNode) => {
    if (!selectedNode) return;

    if (panel === "actions-change") {
      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          ...node.data,
        },
      };

      updateNodeData(selectedNode.id, updatedNode.data);
      setPanel({ panel: "node", node: updatedNode });

      return;
    }

    const newNode = {
      ...node,
      id: uuid(),
      position: {
        x: selectedNode.position.x,
        y: selectedNode.position.y + 150,
      },
    };

    addNodes(newNode);

    const newEdge = {
      id: uuid(),
      source: selectedNode.id,
      target: newNode.id,
      type: "custom",
    };

    addEdges(newEdge);
    setPanel({ panel: "node", node: newNode });
  };

  return (
    <>
      <div className="p-4">
        <Label>Next step</Label>
        <p className="text-muted-foreground">
          Set the next block in the workflow
        </p>
      </div>
      <Separator />
      <Command>
        <CommandInput placeholder="Search for an action..." />
        <CommandList>
          <CommandEmpty>No action found.</CommandEmpty>
          <CommandGroup>
            {nodes.map((node) => {
              const { data } = node;

              return (
                <CommandItem
                  key={node.id}
                  value={node.data.label}
                  onSelect={() => onSelect(node)}
                  className="space-x-2"
                >
                  <div className="rounded-md border bg-background p-1">
                    {data.icon === "Slack" ? (
                      <Slack size={16} />
                    ) : (
                      <Icon name={data.icon as keyof typeof icons} size={16} />
                    )}
                  </div>
                  <p className="font-medium">{data.label}</p>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  );
};

export const nodes: WorkflowNode[] = [
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "Slack",
      label: "Send Slack message",
      description: "",
      type: "slack-message",
      message: "",
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "Filter",
      label: "Filter",
      description: "",
      type: "filter",
      groupFilter: {
        filters: [],
        operator: "AND",
      },
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "SquareCheckBig",
      label: "Task",
      description: "",
      type: "task",
      task: "",
      assignee: "",
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "Clock",
      label: "Wait",
      description: "",
      type: "wait",
      duration: 0,
      unit: "seconds",
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "Webhook",
      label: "Webhook",
      description: "",
      type: "webhook",
      url: undefined,
    },
  },
];
