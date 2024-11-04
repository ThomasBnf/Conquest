import { Button } from "@conquest/ui/button";
import { Label } from "@conquest/ui/label";
import { useReactFlow } from "@xyflow/react";
import { Icon } from "components/icons/Icon";
import cuid from "cuid";
import type { icons } from "lucide-react";
import { useChanging } from "../hooks/useChanging";
import { useSelected } from "../hooks/useSelected";
import type { WorkflowNode } from "./types/workflow-node.type";

export const ActionPanel = () => {
  const { selected } = useSelected();
  const { isChanging } = useChanging();
  const { addNodes, updateNodeData } = useReactFlow();

  const onSelect = (node: WorkflowNode) => {
    if (isChanging && selected) {
      updateNodeData(selected.id, {
        id: selected.id,
        ...node.data,
      });
    } else {
      addNodes([
        {
          ...node,
          id: cuid(),
          position: {
            x: selected?.position.x ?? 0,
            y: (selected?.position.y ?? 0) + 200,
          },
        },
      ]);
    }
  };

  return (
    <div className="p-6 flex-grow">
      <div>
        <Label>Next step</Label>
        <p className="text-muted-foreground">
          Set the next block in the workflow
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
                      onClick={() => onSelect(node)}
                    >
                      <div className="border rounded-lg bg-green-100 border-green-200 p-1">
                        <Icon
                          name={data.icon as keyof typeof icons}
                          size={15}
                          className="text-green-500"
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
    </div>
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
      label: "Records",
      nodes: [
        {
          id: cuid(),
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            icon: "FileSearch",
            label: "List members",
            description: "",
            type: "list-members",
            category: "records",
            group_filters: [],
          },
        },
      ],
    },
    {
      label: "Mutations",
      nodes: [
        {
          id: cuid(),
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
          id: cuid(),
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
      ],
    },
    {
      label: "Communications",
      nodes: [
        {
          id: cuid(),
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            icon: "MessageCircle",
            label: "Send Slack message",
            description: "",
            type: "slack-message",
            category: "communications",
            message: "",
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
          id: cuid(),
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
      ],
    },
  ],
};
