"use client";

import { _updateMember } from "@/features/members/actions/_updateMember";
import { Button } from "@conquest/ui/button";
import {
  Popover,
  PopoverCheckboxItem,
  PopoverContent,
  PopoverTrigger,
} from "@conquest/ui/popover";
import type { Company } from "@conquest/zod/company.schema";
import type { Member } from "@conquest/zod/member.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "./tag-badge";

type Props = {
  record: Member | Company;
  tags: Tag[] | undefined;
};

export const TagPicker = ({ record, tags }: Props) => {
  const [recordTags, setRecordTags] = useState(record?.tags ?? []);

  const handleTagToggle = async (tag: Tag) => {
    setRecordTags((prevTags) => {
      const updatedTags = prevTags.includes(tag.id)
        ? prevTags.filter((id) => id !== tag.id)
        : [...prevTags, tag.id];

      _updateMember({ id: record.id, tags: updatedTags });
      return updatedTags;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-wrap items-center gap-1.5">
          {recordTags?.map((tagId) => (
            <TagBadge
              key={tagId}
              tag={tags?.find((t) => t.id === tagId)}
              isClickable
            />
          ))}
          <Button variant="ghost" size="xs" className="text-muted-foreground">
            {recordTags?.length > 0 && <Plus size={15} />}
            {recordTags?.length === 0 && "Add tags"}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-72"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {tags && tags?.length > 0 ? (
          tags?.map((tag) => (
            <PopoverCheckboxItem
              key={tag.id}
              checked={recordTags?.includes(tag.id)}
              onCheckedChange={() => handleTagToggle(tag)}
            >
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </PopoverCheckboxItem>
          ))
        ) : (
          <p className="text-muted-foreground">No tags found</p>
        )}
      </PopoverContent>
    </Popover>
  );
};
