import { Icon } from "@/components/custom/Icon";
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
import { useReactFlow } from "@xyflow/react";
import { type icons } from "lucide-react";
import { v4 as uuid } from "uuid";
import { usePanel } from "../hooks/usePanel";

import type { WorkflowNode } from "./schemas/workflow-node.type";

export const TriggerPanel = () => {
  const { node: selectedNode, setPanel } = usePanel();
  const { addNodes, updateNode } = useReactFlow();

  const onSelect = (node: WorkflowNode) => {
    if (selectedNode) {
      updateNode(selectedNode.id, node);
    } else {
      addNodes({
        ...node,
        selected: true,
      });
    }

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
        <CommandInput placeholder="Search for an trigger..." />
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
                  className="space-x-2"
                >
                  <div className="rounded-md border bg-background p-1">
                    <Icon name={data.icon as keyof typeof icons} size={16} />
                  </div>
                  <p className="font-medium">{data.label}</p>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
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
