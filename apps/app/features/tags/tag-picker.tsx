"use client";

import { updateMemberAction } from "@/features/members/actions/updateMemberAction";
import { Button } from "@conquest/ui/button";
import {
  Popover,
  PopoverCheckboxItem,
  PopoverContent,
  PopoverTrigger,
} from "@conquest/ui/popover";
import type { Member } from "@conquest/zod/member.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "./tag-badge";

type Props = {
  member: Member;
  tags: Tag[] | undefined;
};

export const TagPicker = ({ member, tags }: Props) => {
  const [memberTags, setMemberTags] = useState(member?.tags);

  const handleTagToggle = async (tag: Tag) => {
    setMemberTags((prevTags) => {
      const updatedTags = prevTags.includes(tag.id)
        ? prevTags.filter((id) => id !== tag.id)
        : [...prevTags, tag.id];

      updateMemberAction({ id: member.id, tags: updatedTags });
      return updatedTags;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-wrap items-center gap-1.5">
          {memberTags.map((tagId) => (
            <TagBadge
              key={tagId}
              tag={tags?.find((t) => t.id === tagId)}
              isClickable
            />
          ))}
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground -ml-1.5"
          >
            {memberTags.length > 0 && <Plus size={15} />}
            {memberTags.length === 0 && "Add tags"}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-60"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {tags?.map((tag) => (
          <PopoverCheckboxItem
            key={tag.id}
            checked={memberTags.includes(tag.id)}
            onCheckedChange={() => handleTagToggle(tag)}
          >
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
          </PopoverCheckboxItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};
