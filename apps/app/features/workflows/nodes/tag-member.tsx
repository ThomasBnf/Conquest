import { TagPicker } from "@/features/tags/tag-picker";
import { Label } from "@conquest/ui/label";
import { NodeTagMemberSchema } from "@conquest/zod/schemas/node.schema";
import { useReactFlow } from "@xyflow/react";
import { usePanel } from "../hooks/usePanel";

export const TagMember = () => {
  const { node, setPanel } = usePanel();
  const { updateNodeData } = useReactFlow();

  const parsedData = NodeTagMemberSchema.parse(node?.data);

  const onSelectTag = (tags: string[]) => {
    if (!node) return;

    const updatedNode = {
      ...node,
      data: {
        ...parsedData,
        tags,
      },
    };

    setPanel({ panel: "node", node: updatedNode });
    updateNodeData(node.id, updatedNode.data);
  };

  return (
    <div className="space-y-1">
      <Label>Tags</Label>
      <TagPicker
        tags={parsedData.tags}
        onUpdate={onSelectTag}
        variant="outline"
        className="h-9"
      />
    </div>
  );
};
