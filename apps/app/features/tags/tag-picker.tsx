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
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
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
  const [recordTags, setRecordTags] = useState(record?.tags ?? []);

  const utils = trpc.useUtils();
  const existingTag = tags?.find((tag) => tag.name === value);

  const { mutateAsync: createTag } = trpc.tags.postOptimistic.useMutation({
    onMutate: async (newTag) => {
      await utils.tags.list.cancel();

      const previousTags = utils.tags.list.getData();

      utils.tags.list.setData(undefined, (prevTags) => {
        return [...(prevTags ?? []), newTag];
      });

      setRecordTags((prevTags) => [...prevTags, newTag.id]);
      onUpdate([...recordTags, newTag.id]);
      setValue("");

      return { previousTags, newTag };
    },
    onError: (err, newTag, context) => {
      if (context?.previousTags) {
        utils.tags.list.setData(undefined, context.previousTags);
      }
      setRecordTags(record?.tags ?? []);
      onUpdate(record?.tags ?? []);
    },
    onSettled: () => {
      utils.tags.list.invalidate();
    },
  });

  const onSelectTag = (tag: Tag) => {
    setRecordTags((prevTags) => {
      const updatedTags = prevTags.includes(tag.id)
        ? prevTags.filter((id) => id !== tag.id)
        : [...prevTags, tag.id];

      onUpdate(updatedTags);
      return updatedTags;
    });
  };

  const onAddTag = () => {
    createTag({
      id: uuid(),
      externalId: null,
      name: value,
      color: "#0070f3",
      source: "Manual",
      workspaceId: record.workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex w-full cursor-pointer flex-wrap items-center gap-1.5">
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
          >
            <Plus size={16} />
            Add tags
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        side="bottom"
        align="start"
        alignOffset={-5}
      >
        <Command>
          <CommandInput
            placeholder="Search..."
            value={value}
            onValueChange={setValue}
          />
          <CommandList>
            <CommandGroup heading="Select or create tag">
              {tags?.map((tag) => (
                <CommandItem key={tag.id} className="p-0 pr-1">
                  <div
                    className="flex h-full w-full items-center p-1"
                    onClick={() => onSelectTag(tag)}
                  >
                    <Checkbox
                      checked={recordTags.includes(tag.id)}
                      className="mr-2"
                    />
                    <TagBadge tag={tag} />
                  </div>
                  <TagMenuDialog tag={tag} onUpdate={onUpdate} />
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
