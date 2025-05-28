import { Icon } from "@/components/custom/Icon";
import { DISCORD_PERMISSIONS, DISCORD_SCOPES } from "@/constant";
import { trpc } from "@/server/client";
import { User } from "@conquest/db/prisma";
import { env } from "@conquest/env";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Discord } from "@conquest/ui/icons/Discord";
import { Slack } from "@conquest/ui/icons/Slack";
import { Label } from "@conquest/ui/label";
import { Separator } from "@conquest/ui/separator";
import { Edge } from "@conquest/zod/schemas/edge.schema";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { useReactFlow } from "@xyflow/react";
import { Plus, type icons } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { useWorkflow } from "../context/workflowContext";
import type { WorkflowNode } from "./schemas/workflow-node.type";

export const ActionPanel = () => {
  const { data: session } = useSession();
  const { user } = session ?? {};
  const router = useRouter();

  const {
    node: selectedNode,
    setNode,
    panel,
    setPanel,
    condition,
  } = useWorkflow();

  const { addNodes, addEdges, updateNodeData, setEdges } = useReactFlow();

  const { data } = trpc.integrations.bySource.useQuery({ source: "Discord" });
  const discord = data ? DiscordIntegrationSchema.parse(data) : null;

  const { permissions } = discord?.details ?? {};
  const hasPermissions = permissions === DISCORD_PERMISSIONS;

  const onUpdatePermissions = () => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      permissions: DISCORD_PERMISSIONS,
      redirect_uri: `${env.NEXT_PUBLIC_URL}/connect/discord`,
    });

    router.push(
      `https://discord.com/oauth2/authorize?${params.toString()}&scope=${DISCORD_SCOPES}`,
    );
  };

  const onSelect = (node: WorkflowNode) => {
    if (!selectedNode) return;

    if (!hasPermissions && node.data.type.startsWith("discord")) {
      onUpdatePermissions();
      return;
    }

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

      setPanel("node");
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
    setPanel("node");
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
                    ) : node.data.icon === "Discord" ? (
                      <Discord size={16} />
                    ) : (
                      <Icon
                        name={node.data.icon as keyof typeof icons}
                        size={16}
                      />
                    )}
                  </div>
                  <p className="flex-1">{node.data.label}</p>
                  {!hasPermissions && group.category === "Discord" && (
                    <div className="rounded-md border bg-background p-1">
                      <Plus size={16} />
                    </div>
                  )}
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
    category: "Discord",
    nodes: [
      {
        id: uuid(),
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          icon: "Discord",
          label: "Send DM as Bot",
          description: "",
          type: "discord-message",
          message: "",
        },
      },
    ],
  },
  {
    category: "Slack",
    nodes: [
      {
        id: uuid(),
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          icon: "Slack",
          label: "Send DM as user",
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
          assignee: user?.id ?? null,
          alertByEmail: true,
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
          body: undefined,
        },
      },
    ],
  },
];
