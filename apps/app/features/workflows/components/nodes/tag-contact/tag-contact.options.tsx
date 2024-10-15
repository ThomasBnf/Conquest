import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { Label } from "@conquest/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
} from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import { NodeTagContactSchema } from "@conquest/zod/node.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useWorkflow } from "context/workflowContext";
import { TagBadge } from "features/tags/tag-badge";
import { useListTags } from "hooks/useListTags";
import { Plus, TagIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const TagContactOptions = () => {
  const { tags, isLoading } = useListTags();
  const { currentNode, onUpdateNode } = useWorkflow();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (currentNode) {
      const parsedData = NodeTagContactSchema.parse(currentNode.data);
      setSelectedTags(parsedData.tags);
    }
  }, [currentNode]);

  const handleSelectTag = (tag: Tag) => {
    if (!currentNode) return;

    const parsedData = NodeTagContactSchema.parse(currentNode.data);

    const updatedTags = selectedTags.includes(tag.id)
      ? selectedTags.filter((selectedTag) => selectedTag !== tag.id)
      : [...selectedTags, tag.id];

    setSelectedTags(updatedTags);

    onUpdateNode({
      ...currentNode,
      data: {
        ...parsedData,
        tags: updatedTags,
      },
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Tags</Label>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-wrap items-center gap-1 rounded-md border px-2 py-[0.4375rem]">
            {selectedTags.map((tagId) => {
              const tag = tags?.find((t) => t.id === tagId);
              return tag ? (
                <TagBadge
                  key={tagId}
                  tag={tag}
                  onDelete={(event) => {
                    event.stopPropagation();
                    handleSelectTag(tag);
                  }}
                />
              ) : null;
            })}
            <Button variant="ghost" size="xs" className="text-muted-foreground">
              {selectedTags.length === 0 ? (
                <TagIcon size={14} />
              ) : (
                <Plus size={14} />
              )}
              {selectedTags.length === 0 ? "Select tags" : ""}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-52"
          align="start"
        >
          {isLoading ? (
            <Skeleton className="h-5 w-full" />
          ) : (
            tags?.map((tag) => (
              <PopoverItem key={tag.id} onClick={() => handleSelectTag(tag)}>
                <Checkbox checked={selectedTags.includes(tag.id)} />
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </PopoverItem>
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
