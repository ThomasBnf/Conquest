import { Icon } from "@/components/custom/Icon";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@conquest/ui/command";
import { Slack } from "@conquest/ui/icons/Slack";
import { Label } from "@conquest/ui/label";
import { useReactFlow } from "@xyflow/react";
import type { icons } from "lucide-react";
import { v4 as uuid } from "uuid";
import { usePanel } from "../hooks/usePanel";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "./schemas/workflow-node.type";

export const ActionPanel = () => {
  const { selected } = useSelected();
  const { panel } = usePanel();
  const { addNodes, updateNodeData } = useReactFlow();

  const onSelect = (node: WorkflowNode) => {
    if (selected && panel === "actions-change") {
      return updateNodeData(selected.id, {
        id: selected.id,
        ...node.data,
      });
    }

    addNodes([
      {
        ...node,
        id: uuid(),
        position: {
          x: selected?.position.x ?? 0,
          y: (selected?.position.y ?? 0) + 200,
        },
      },
    ]);
  };

  return (
    <div className="p-4">
      <div>
        <Label>Next step</Label>
        <p className="text-muted-foreground">
          Set the next block in the workflow
        </p>
      </div>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile</CommandItem>
            <CommandItem>Billing</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <div className="mt-2 flex flex-col gap-1">
        {nodes.map((node) => {
          const { data } = node;

          return (
            <Button
              key={node.id}
              variant="outline"
              size="default"
              className="justify-start px-1.5"
              onClick={() => onSelect(node)}
            >
              <div className="rounded-md border p-1">
                {data.icon === "Slack" ? (
                  <Slack size={16} />
                ) : (
                  <Icon name={data.icon as keyof typeof icons} size={16} />
                )}
              </div>
              <p className="font-medium">{data.label}</p>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export const nodes: WorkflowNode[] = [
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "Tag",
      label: "Add tag to member",
      description: "",
      type: "add-tag",
      category: "mutations",
      tags: [],
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "Tag",
      label: "Remove tag from member",
      description: "",
      type: "remove-tag",
      category: "mutations",
      tags: [],
    },
  },
  {
    id: uuid(),
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      icon: "Slack",
      label: "Send Slack message",
      description: "",
      type: "slack-message",
      category: "communications",
      message: "",
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
      category: "utilities",
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
      category: "utilities",
      url: undefined,
    },
  },
];
// {
//   categories: [
//     {
//       label: "Records",
//       nodes: [
//         {
//           id: uuid(),
//           type: "custom",
//           position: { x: 0, y: 0 },
//           data: {
//             icon: "FileSearch",
//             label: "List members",
//             description: "",
//             type: "list-members",
//             category: "records",
//             filters: [],
//           },
//         },
//       ],
//     },
//     {
//       label: "Mutations",
//       nodes: [
//         {
//           id: uuid(),
//           type: "custom",
//           position: { x: 0, y: 0 },
//           data: {
//             icon: "Tag",
//             label: "Add tag to member",
//             description: "",
//             type: "add-tag",
//             category: "mutations",
//             tags: [],
//           },
//         },
//         {
//           id: uuid(),
//           type: "custom",
//           position: { x: 0, y: 0 },
//           data: {
//             icon: "Tag",
//             label: "Remove tag from member",
//             description: "",
//             type: "remove-tag",
//             category: "mutations",
//             tags: [],
//           },
//         },
//       ],
//     },
//     {
//       label: "Communications",
//       nodes: [
//         {
//           id: uuid(),
//           type: "custom",
//           position: { x: 0, y: 0 },
//           data: {
//             icon: "Slack",
//             label: "Send Slack message",
//             description: "",
//             type: "slack-message",
//             category: "communications",
//             message: "",
//           },
//         },
//       ],
//     },
//     {
//       label: "Utilities",
//       nodes: [
//         {
//           id: uuid(),
//           type: "custom",
//           position: { x: 0, y: 0 },
//           data: {
//             icon: "Clock",
//             label: "Wait",
//             description: "",
//             type: "wait",
//             category: "utilities",
//             duration: 0,
//             unit: "seconds",
//           },
//         },
//         {
//           id: uuid(),
//           type: "custom",
//           position: { x: 0, y: 0 },
//           data: {
//             icon: "RefreshCw",
//             label: "Loop",
//             description: "",
//             type: "loop",
//             category: "utilities",
//             sub_nodes: [],
//           },
//         },
//         {
//           id: uuid(),
//           type: "custom",
//           position: { x: 0, y: 0 },
//           data: {
//             icon: "Webhook",
//             label: "Webhook",
//             description: "",
//             type: "webhook",
//             category: "utilities",
//             url: undefined,
//           },
//         },
//       ],
//     },
//   ],
// };
