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
import { Node, Trigger } from "@conquest/zod/schemas/node.schema";
import type { Workflow } from "@conquest/zod/schemas/workflow.schema";
import { useReactFlow } from "@xyflow/react";
import { type icons } from "lucide-react";
import { v4 as uuid } from "uuid";
import { useNode } from "../hooks/useNode";
import { usePanel } from "../hooks/usePanel";
import type { WorkflowNode } from "./schemas/workflow-node.type";

type Props = {
  workflow: Workflow;
};

export const TriggerPanel = ({ workflow }: Props) => {
  const { setPanel } = usePanel();
  const { node: selectedNode, setNode } = useNode();
  const { addNodes, updateNode } = useReactFlow();

  const { mutateAsync } = trpc.workflows.update.useMutation();

  const onSelect = async (node: WorkflowNode) => {
    if (selectedNode) {
      updateNode(selectedNode.id, node);
    } else {
      addNodes([node]);
    }

    await mutateAsync({ ...workflow, trigger: node.data.type as Trigger });

    setPanel({ panel: "node" });
    setNode(node);
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
        <CommandList className="max-h-full">
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
      icon: "UserPlus",
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
      icon: "TrendingUp",
      label: "Level up",
      description: "When a member has level up",
      type: "level-up" as const,
      isTrigger: true,
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "TrendingDown",
      label: "Level down",
      description: "When a member has level down",
      type: "level-down" as const,
      isTrigger: true,
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "TriangleAlert",
      label: "At-risk member",
      description:
        "When a member is level 4 and has not been active for 30 days",
      type: "at-risk-member" as const,
      isTrigger: true,
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "Megaphone",
      label: "Potential ambassador",
      description:
        "When a member is level 7 to 9 and has been active for 30 days",
      type: "potential-ambassador" as const,
      isTrigger: true,
    },
  },
];
