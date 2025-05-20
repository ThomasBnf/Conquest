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
import { useNode } from "../hooks/useNode";
import { usePanel } from "../hooks/usePanel";
import type { WorkflowNode } from "./schemas/workflow-node.type";

export const ActionPanel = () => {
  const { data: session } = useSession();
  const { user } = session ?? {};

  const { node: selectedNode, setNode } = useNode();
  const { panel, condition, setPanel } = usePanel();
  const { addNodes, addEdges, updateNodeData, setEdges } = useReactFlow();

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

      const isIfElse = node.data.type === "if-else";

      if (isIfElse) {
        setEdges((eds) =>
          eds.filter((edge) => edge.source !== selectedNode.id),
        );
      }

      setPanel({ panel: "node" });
      setNode(updatedNode);
      updateNodeData(selectedNode.id, updatedNode.data);

      return;
    }

    const newNode = {
      ...node,
      id: uuid(),
      position: {
        x: selectedNode.position.x + (condition === "false" ? 400 : 0),
        y: selectedNode.position.y + 200,
      },
    };

    addNodes(newNode);

    const isIfElse = selectedNode.data.type === "if-else";

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
    setPanel({ panel: "node" });
    setNode(newNode);
  };

  return (
    <>
      <div className="p-4">
        <Label>Next step</Label>
        <p className="text-muted-foreground">
          Set the next node in the workflow
        </p>
      </div>
      <Separator />
      <Command>
        <CommandInput placeholder="Search for an action..." />
        <CommandList className="max-h-full">
          <CommandEmpty>No action found.</CommandEmpty>
          {nodes(user).map((group) => (
            <CommandGroup key={group.category} heading={group.category}>
              {group.nodes.map((node) => (
                <CommandItem
                  key={node.id}
                  value={node.data.label}
                  onSelect={() => onSelect(node)}
                  className="space-x-2"
                >
                  <div className="rounded-md border bg-background p-1">
                    {node.data.icon === "Slack" ? (
                      <Slack size={16} />
                    ) : (
                      <Icon
                        name={node.data.icon as keyof typeof icons}
                        size={16}
                      />
                    )}
                  </div>
                  <p>{node.data.label}</p>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </>
  );
};

export const nodes = (
  user: User | undefined,
): {
  category: string;
  nodes: WorkflowNode[];
}[] => [
  {
    category: "Integrations",
    nodes: [
      {
        id: uuid(),
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          icon: "Slack",
          label: "Send private message",
          description: "",
          type: "slack-message",
          message: "",
        },
      },
    ],
  },
  {
    category: "Tags",
    nodes: [
      {
        id: uuid(),
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          icon: "Tag",
          label: "Add tag",
          description: "",
          type: "add-tag",
          tags: [],
        },
      },
      {
        id: uuid(),
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          icon: "Tag",
          label: "Remove tag",
          description: "",
          type: "remove-tag",
          tags: [],
        },
      },
    ],
  },
  {
    category: "Tasks",
    nodes: [
      {
        id: uuid(),
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          icon: "SquareCheckBig",
          label: "Create task",
          description: "",
          type: "task",
          title: "",
          days: 2,
          assignee: user?.id ?? "",
        },
      },
    ],
  },
  {
    category: "Conditions",
    nodes: [
      {
        id: uuid(),
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          icon: "Split",
          label: "If / else",
          description: "",
          type: "if-else",
          groupFilters: {
            filters: [],
            operator: "AND",
          },
        },
      },
    ],
  },
  {
    category: "Utilities",
    nodes: [
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
    ],
  },
];
