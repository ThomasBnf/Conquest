import { Icon } from "@/components/custom/Icon";
import { trpc } from "@/server/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Label } from "@conquest/ui/label";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { Node } from "@conquest/zod/schemas/node.schema";
import type { Trigger, Workflow } from "@conquest/zod/schemas/workflow.schema";
import { useReactFlow } from "@xyflow/react";
import { type icons } from "lucide-react";
import { v4 as uuid } from "uuid";
import { usePanel } from "../hooks/usePanel";
import type { WorkflowNode } from "./schemas/workflow-node.type";

type Props = {
  workflow: Workflow;
};

export const TriggerPanel = ({ workflow }: Props) => {
  const { id } = workflow;
  const { node: selectedNode, setPanel } = usePanel();
  const { addNodes, updateNode } = useReactFlow();

  const { mutateAsync } = trpc.workflows.update.useMutation();

  const onSelect = async (node: WorkflowNode) => {
    if (selectedNode) {
      updateNode(selectedNode.id, node);
    } else {
      addNodes(node);
    }

    await mutateAsync({ id, trigger: node.data.type as Trigger });

    setPanel({ panel: "node", node });
  };

  return (
    <ScrollArea>
      <div className="p-4">
        <Label>Triggers</Label>
        <p className="text-muted-foreground">
          Pick an trigger to start this workflow
        </p>
      </div>
      <Separator />
      <Command>
        <CommandInput placeholder="Search for a trigger..." />
        <CommandList>
          <CommandEmpty>No trigger found.</CommandEmpty>
          <CommandGroup>
            {nodes.map((node) => {
              const { data } = node;

              return (
                <CommandItem
                  key={node.id}
                  value={node.data.label}
                  onSelect={() => onSelect(node)}
                  className="items-start space-x-2"
                >
                  <div className="rounded-md border bg-background p-1">
                    <Icon name={data.icon as keyof typeof icons} size={16} />
                  </div>
                  <div>
                    <p className="font-medium">{data.label}</p>
                    <p className="text-muted-foreground">{data.description}</p>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </ScrollArea>
  );
};

export const nodes: Node[] = [
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "User",
      label: "Member created",
      description: "When a member is created",
      type: "member-created" as const,
      isTrigger: true,
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "UserPlus",
      label: "Level reached",
      description: "When a member has reached a new level",
      type: "level-reached" as const,
      isTrigger: true,
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "UserMinus",
      label: "At-risk member",
      description: "When a member becomes at-risk",
      type: "at-risk-member" as const,
      isTrigger: true,
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "UserPlus",
      label: "Potential ambassador",
      description: "When a member becomes a potential mbassador",
      type: "potential-ambassador" as const,
      isTrigger: true,
    },
  },
];
