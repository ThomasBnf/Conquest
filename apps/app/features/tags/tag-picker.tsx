"use client";

import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
} from "@conquest/ui/popover";
import { updateContact } from "actions/contacts/updateContact";
import { Plus, Tag } from "lucide-react";
import { useState } from "react";
import type { Contact } from "schemas/contact.schema";
import type { Tag as TTag } from "schemas/tag.schema";
import { TagBadge } from "./tag-badge";

type Props = {
  contact: Contact;
  tags: TTag[] | undefined;
};

export const TagPicker = ({ contact, tags }: Props) => {
  const [contactTags, setContactTags] = useState(contact?.tags);

  const handleTagToggle = async (tag: TTag) => {
    setContactTags((prevTags) => {
      const updatedTags = prevTags.includes(tag.id)
        ? prevTags.filter((id) => id !== tag.id)
        : [...prevTags, tag.id];

      updateContact({ id: contact.id, tags: updatedTags });
      return updatedTags;
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Tag size={15} className="shrink-0 text-muted-foreground" />
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-wrap items-center gap-1.5">
            {contactTags.map((tagId) => (
              <TagBadge
                key={tagId}
                tag={tags?.find((t) => t.id === tagId)}
                isClickable
              />
            ))}
            <Button variant="ghost" size="xs" className="text-muted-foreground">
              {contactTags.length > 0 && <Plus size={15} />}
              {contactTags.length === 0 && "Add tags"}
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
              <Checkbox checked={contactTags.includes(tag.id)} />
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
