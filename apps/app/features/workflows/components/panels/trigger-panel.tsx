import { Label } from "@conquest/ui/label";
import type { Node as NodeType } from "@conquest/zod/node.schema";
import { Icon } from "components/icons/Icon";
import { useWorkflow } from "context/workflowContext";

export const TriggerPanel = () => {
  const { onAddNode } = useWorkflow();

  return (
    <div className="p-6">
      <div>
        <p className="font-medium">Triggers</p>
        <p className="text-muted-foreground">
          Pick an event to start this workflow
        </p>
      </div>
      <div className="flex flex-col gap-1">
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
                      onClick={() => onAddNode(node)}
                      className="cursor-pointer rounded-md border p-2 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-md border bg-background p-1">
                          <Icon
                            name={data.icon}
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
      label: "Utilities",
      nodes: [
        {
          id: "1",
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            icon: "Calendar",
            label: "Recurring schedule",
            description: "Trigger a workflow on a schedule",
            type: "trigger-recurring-schedule",
            category: "utilities",
            frequency: "daily",
            repeat_on: ["monday"],
            time: "05:00",
          },
        },
      ],
    },
  ],
};
