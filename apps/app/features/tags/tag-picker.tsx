"use client";

import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
} from "@conquest/ui/popover";
import type { Member } from "@conquest/zod/member.schema";
import type { Tag as TTag } from "@conquest/zod/tag.schema";
import { updateMember } from "actions/members/updateMember";
import { Plus, Tag } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "./tag-badge";

type Props = {
  member: Member;
  tags: TTag[] | undefined;
};

export const TagPicker = ({ member, tags }: Props) => {
  const [memberTags, setMemberTags] = useState(member?.tags);

  const handleTagToggle = async (tag: TTag) => {
    setMemberTags((prevTags) => {
      const updatedTags = prevTags.includes(tag.id)
        ? prevTags.filter((id) => id !== tag.id)
        : [...prevTags, tag.id];

      updateMember({ id: member.id, tags: updatedTags });
      return updatedTags;
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Tag size={15} className="shrink-0 text-muted-foreground" />
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
            <Button variant="ghost" size="xs" className="text-muted-foreground">
              {memberTags.length > 0 && <Plus size={15} />}
              {memberTags.length === 0 && "Add tags"}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-60"
          align="start"
          side="left"
        >
          {tags?.map((tag) => (
            <PopoverItem key={tag.id} onClick={() => handleTagToggle(tag)}>
              <Checkbox checked={memberTags.includes(tag.id)} />
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </PopoverItem>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};
