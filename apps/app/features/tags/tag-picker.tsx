import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Plus, TagIcon } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useCreateTag } from "./mutations/useCreateTag";
import { TagBadge } from "./tag-badge";
import { TagMenuDialog } from "./tag-menu-dialog";

type Props = {
  record: Member | Company;
  onUpdate: (tags: string[]) => void;
  className?: string;
};

export const TagPicker = ({ record, onUpdate, className }: Props) => {
  const { data: tags } = trpc.tags.list.useQuery();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const createTag = useCreateTag({ tags: record.tags, onUpdate });
  const existingTag = tags?.find((tag) => tag.name === value);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(true);
  };

  const onSelectTag = (tagId: string) => {
    const hasTag = record.tags?.includes(tagId);
    const newTags = hasTag
      ? record.tags?.filter((id) => id !== tagId)
      : [...(record.tags ?? []), tagId];

    onUpdate(newTags);
  };

  const onAddTag = () => {
    createTag({
      id: uuid(),
      externalId: null,
      name: value,
      color: "#0070f3",
      source: "Manual" as const,
      workspaceId: record.workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={onClick}>
        <div
          className={cn(
            "flex w-full cursor-pointer flex-wrap items-center gap-1 ",
            record.tags?.length > 0 && "pl-[9px]",
          )}
        >
          {record.tags?.map((tagId) => (
            <TagBadge
              key={tagId}
              tag={tags?.find((t) => t.id === tagId)}
              onDelete={() => onSelectTag(tagId)}
              deletable={open}
            />
          ))}
          <Button
            variant="ghost"
            size={record.tags?.length > 0 ? "icon_sm" : "sm"}
            className={cn("text-muted-foreground", className)}
          >
            {record.tags?.length > 0 ? (
              <Plus size={16} />
            ) : (
              <TagIcon size={16} />
            )}
            {record.tags?.length === 0 && "Add tags"}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="left" align="start" sideOffset={5}>
        <Command>
          <CommandInput
            placeholder="Search..."
            value={value}
            onValueChange={setValue}
          />
          <CommandList>
            <CommandGroup heading="Select or create tag">
              {tags?.map((tag) => (
                <CommandItem key={tag.id} className="group">
                  <div
                    className="flex h-full w-full items-center"
                    onClick={() => onSelectTag(tag.id)}
                  >
                    <Checkbox
                      checked={record.tags?.includes(tag.id)}
                      className="mr-2"
                    />
                    <TagBadge tag={tag} />
                  </div>
                  <TagMenuDialog tag={tag} />
                </CommandItem>
              ))}
            </CommandGroup>
            {value && !existingTag && (
              <CommandGroup>
                <CommandItem value={value} onSelect={onAddTag}>
                  <span className="mr-2">Create</span>
                  <Badge variant="secondary">
                    <div
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: "#0070f3" }}
                    />
                    <p className="whitespace-nowrap leading-none">{value}</p>
                  </Badge>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
