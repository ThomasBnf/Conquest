import { useWorkflow } from "@/context/workflowContext";
import { Label } from "@conquest/ui/label";
import type { Node as NodeType } from "@conquest/zod/node.schema";
import { Icon } from "components/icons/Icon";
import type { icons } from "lucide-react";

export const ActionPanel = () => {
  const { currentNode, onAddNode, onUpdateNode, setChanging } = useWorkflow();

  return (
    <div className="p-6">
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
                    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                    <div
                      key={node.id}
                      onClick={() => {
                        if (currentNode) {
                          setChanging(false);
                          onUpdateNode({ ...currentNode, data: node.data });
                        } else {
                          onAddNode(node);
                        }
                      }}
                      className="cursor-pointer rounded-lg border p-2 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg border bg-background p-1">
                          <Icon
                            name={data.icon as keyof typeof icons}
                            size={14}
                            className="text-muted-foreground"
                          />
                        </div>
                        <p className="font-medium">{data.label}</p>
                      </div>
                    </div>
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
    nodes: NodeType[];
  }[];
} = {
  categories: [
    {
      label: "Records",
      nodes: [
        {
          id: "1",
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            icon: "FileSearch",
            label: "List records",
            description: "",
            type: "list-records",
            category: "records",
            source: "members",
            group_filters: [],
          },
        },
      ],
    },
    {
      label: "Mutations",
      nodes: [
        {
          id: "1",
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
          id: "2",
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
      label: "Utilities",
      nodes: [
        {
          id: "1",
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
