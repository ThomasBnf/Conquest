import { TagBadge } from "@/features/tags/tag-badge";
import { useSelected } from "@/features/workflows/hooks/useSelected";
import { useListTags } from "@/queries/hooks/useListTags";
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

export const TagMember = () => {
  const { selected } = useSelected();
  const { updateNodeData } = useReactFlow();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: tags, isLoading } = useListTags();

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
              return tag ? <TagBadge key={tagId} tag={tag} /> : null;
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
            <p className="text-muted-foreground text-sm">No tags found</p>
          )}
          {isLoading ? (
            <Skeleton className="h-5 w-full" />
          ) : (
            tags?.map((tag) => (
              <PopoverItem key={tag.id} onClick={() => handleSelectTag(tag)}>
                <Checkbox checked={selectedTags.includes(tag.id)} />
                <div
                  className="size-3 shrink-0 rounded-full"
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
