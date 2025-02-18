import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "./tag-badge";

type Props = {
  record: Member | Company;
  onUpdate: (tags: string[]) => void;
  className?: string;
};

export const TagPicker = ({ record, onUpdate, className }: Props) => {
  const { data: tags } = trpc.tags.getAllTags.useQuery();

  const [recordTags, setRecordTags] = useState(record?.tags ?? []);

  const handleTagToggle = async (tag: Tag) => {
    setRecordTags((prevTags) => {
      const updatedTags = prevTags.includes(tag.id)
        ? prevTags.filter((id) => id !== tag.id)
        : [...prevTags, tag.id];

      onUpdate(updatedTags);
      return updatedTags;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex w-full flex-wrap items-center gap-1.5">
          {recordTags?.map((tagId) => (
            <TagBadge key={tagId} tag={tags?.find((t) => t.id === tagId)} />
          ))}
          <Button
            variant="ghost"
            size="xs"
            className={cn(
              "text-muted-foreground",
              recordTags.length > 0 ? "" : "-ml-1.5",
              className,
            )}
            classNameSpan="justify-start"
          >
            <Plus size={16} />
            Add tags
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[233px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder="Search tags" />
          <CommandList>
            <CommandEmpty>No tags found</CommandEmpty>
            <CommandGroup>
              {tags?.map((tag) => (
                <CommandItem key={tag.id} onSelect={() => handleTagToggle(tag)}>
                  <Checkbox
                    checked={recordTags?.includes(tag.id)}
                    className="mr-2"
                  />
                  <TagBadge tag={tag} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
