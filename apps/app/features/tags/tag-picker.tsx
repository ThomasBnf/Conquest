import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Button, ButtonProps } from "@conquest/ui/button";
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
import { Plus, TagIcon } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useCreateTag } from "./mutations/useCreateTag";
import { TagBadge } from "./tag-badge";
import { TagMenuDialog } from "./tag-menu-dialog";

type Props = {
  tags: string[];
  onUpdate: (tags: string[]) => void;
  source?: "Discord";
  variant?: ButtonProps["variant"];
  className?: string;
};

export const TagPicker = ({
  tags = [],
  onUpdate,
  source,
  variant,
  className,
}: Props) => {
  const { workspace } = useWorkspace();

  const { data: allTags } = trpc.tags.list.useQuery();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const createTag = useCreateTag({ tags, onUpdate });
  const existingTag = allTags?.find((tag) => tag.name === value);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(true);
  };

  const onSelectTag = (tagId: string) => {
    const hasTag = tags.includes(tagId);
    const newTags = hasTag
      ? tags.filter((id) => id !== tagId)
      : [...tags, tagId];

    onUpdate(newTags);
  };

  const onAddTag = () => {
    if (!workspace?.id) return;

    createTag({
      id: uuid(),
      externalId: null,
      name: value,
      color: "#0070f3",
      source: "Manual" as const,
      workspaceId: workspace.id,
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
            "flex flex-wrap gap-1 items-center w-full cursor-pointer",
            className,
          )}
        >
          {tags.map((tagId) => (
            <TagBadge
              key={tagId}
              tag={allTags?.find((t) => t.id === tagId)}
              onDelete={() => onSelectTag(tagId)}
              deletable={open}
            />
          ))}
          <Button variant={variant} size={tags.length > 0 ? "icon_sm" : "sm"}>
            {tags.length > 0 ? <Plus size={16} /> : <TagIcon size={14} />}
            {tags.length === 0 && "Add tags"}
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
              {allTags
                ?.filter((tag) => (source ? tag.source === source : true))
                ?.map((tag) => (
                  <CommandItem key={tag.id} className="group">
                    <div
                      className="flex items-center w-full h-full"
                      onClick={() => onSelectTag(tag.id)}
                    >
                      <Checkbox
                        checked={tags.includes(tag.id)}
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
                  <Badge variant="outline">
                    <div
                      className="rounded-full size-2 shrink-0"
                      style={{ backgroundColor: "#0070f3" }}
                    />
                    <p className="leading-none whitespace-nowrap">{value}</p>
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
