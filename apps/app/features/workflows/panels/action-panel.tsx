import { Icon } from "@/components/custom/Icon";
import { User } from "@conquest/db/prisma";
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
import { Edge } from "@conquest/zod/schemas/edge.schema";
import { useReactFlow } from "@xyflow/react";
import type { icons } from "lucide-react";
import { useSession } from "next-auth/react";
import { v4 as uuid } from "uuid";
import { usePanel } from "../hooks/usePanel";
import type { WorkflowNode } from "./schemas/workflow-node.type";

export const ActionPanel = () => {
  const { data: session } = useSession();
  const { user } = session ?? {};

  const { panel, condition, node: selectedNode, setPanel } = usePanel();
  const { addNodes, addEdges, updateNodeData } = useReactFlow();

  const onSelect = (node: WorkflowNode) => {
    if (!selectedNode) return;

    const isIfElse = selectedNode.data.type === "if-else";

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
        x: selectedNode.position.x + (condition === "false" ? 400 : 0),
        y: selectedNode.position.y + 205,
      },
    };

    addNodes(newNode);

    const newEdge: Edge = {
      id: uuid(),
      source: selectedNode.id,
      target: newNode.id,
      type: "custom",
      ...(isIfElse && {
        data: {
          condition: condition as "true" | "false",
        },
        label: condition === "true" ? "is True" : "is False",
      }),
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
            {nodes(user).map((node) => {
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

export const nodes = (user: User | undefined): WorkflowNode[] => [
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
      icon: "Split",
      label: "If / else",
      description: "",
      type: "if-else",
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
      title: "",
      dueDate: new Date(),
      assignee: user?.id,
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
