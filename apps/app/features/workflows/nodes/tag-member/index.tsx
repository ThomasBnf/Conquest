import { useListTags } from "@/features/tags/hooks/useListTags";
import { TagBadge } from "@/features/tags/tag-badge";
import { useSelected } from "@/features/workflows/hooks/useSelected";
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
import { NodeTagMemberSchema } from "@conquest/zod/node.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { useReactFlow } from "@xyflow/react";
import { Plus, TagIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const TagMemberOptions = () => {
  const { tags, isLoading } = useListTags();
  const { selected } = useSelected();
  const { updateNodeData } = useReactFlow();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const parsedData = NodeTagMemberSchema.parse(selected?.data);

  useEffect(() => {
    if (selected) {
      setSelectedTags(parsedData.tags);
    }
  }, [selected]);

  const handleSelectTag = (tag: Tag) => {
    if (!selected) return;

    const updatedTags = selectedTags.includes(tag.id)
      ? selectedTags.filter((selectedTag) => selectedTag !== tag.id)
      : [...selectedTags, tag.id];

    setSelectedTags(updatedTags);

    updateNodeData(selected.id, {
      ...parsedData,
      tags: updatedTags,
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
            {isLoading ? (
              <Skeleton className="h-6 w-28" />
            ) : (
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground"
              >
                {selectedTags.length === 0 ? (
                  <TagIcon size={14} />
                ) : (
                  <Plus size={14} />
                )}
                {selectedTags.length === 0 ? "Select tags" : ""}
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-52"
          align="start"
        >
          {!isLoading && tags?.length === 0 && (
            <p className="text-sm text-muted-foreground">No tags found</p>
          )}
          {isLoading ? (
            <Skeleton className="h-5 w-full" />
          ) : (
            tags?.map((tag) => (
              <PopoverItem key={tag.id} onClick={() => handleSelectTag(tag)}>
                <Checkbox checked={selectedTags.includes(tag.id)} />
                <div
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <p className="truncate">{tag.name}</p>
              </PopoverItem>
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
