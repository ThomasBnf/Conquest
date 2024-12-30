import { addTagsMembers } from "@/actions/members/addTagsMembers";
import { removeTagsMembers } from "@/actions/members/removeTagsMembers";
import { useListTags } from "@/queries/hooks/useListTags";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Separator } from "@conquest/ui/separator";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TagBadge } from "../tags/tag-badge";

type Props = {
  memberId: string;
  memberTags: Tag[];
};

export const TagsCell = ({
  memberId,
  memberTags: initialMemberTags,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [memberTags, setMemberTags] = useState(initialMemberTags);
  const queryClient = useQueryClient();

  const { data: tags } = useListTags();

  const memberSliceTags = memberTags?.slice(0, 1);
  const remainingCount = memberTags?.length > 1 ? memberTags?.slice(1) : [];

  const onSelect = async (tagId: string) => {
    const hasTag = memberTags?.some((tag) => tag.id === tagId);
    const selectedTag = tags?.find((tag) => tag.id === tagId);

    if (!selectedTag) return;

    if (hasTag) {
      setMemberTags((prev) => prev.filter((tag) => tag.id !== tagId));

      const response = await removeTagsMembers({
        ids: [memberId],
        tags: [tagId],
      });

      if (response?.serverError) {
        setMemberTags((prev) => [...prev, selectedTag]);
        toast.error(response.serverError);
        return;
      }
    } else {
      setMemberTags((prev) => [...prev, selectedTag]);

      const response = await addTagsMembers({
        ids: [memberId],
        tags: [tagId],
      });

      if (response?.serverError) {
        setMemberTags((prev) => prev.filter((tag) => tag.id !== tagId));
        toast.error(response.serverError);
        return;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["members"] });
    toast.success(hasTag ? "Tag removed" : "Tag added");
  };

  useEffect(() => {
    setMemberTags(initialMemberTags);
  }, [initialMemberTags]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="h-full flex-1">
        <div className="flex h-full w-full flex-wrap items-center gap-1 p-2 hover:bg-muted">
          {memberSliceTags?.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {remainingCount?.length > 0 && (
            <span className="text-muted-foreground text-xs">
              +{remainingCount?.length}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[251px] rounded-t-none p-0"
        sideOffset={0}
        alignOffset={-1}
        align="start"
      >
        <Command loop>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            {memberTags?.length > 0 && (
              <>
                <CommandGroup>
                  {tags
                    ?.filter((tag) => memberTags?.some((t) => t.id === tag.id))
                    .map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => onSelect(tag.id)}
                      >
                        <Checkbox checked={true} className="mr-2" />
                        <TagBadge tag={tag} />
                      </CommandItem>
                    ))}
                </CommandGroup>
                <Separator />
              </>
            )}
            <CommandGroup>
              {tags
                ?.filter((tag) => !memberTags?.some((t) => t.id === tag.id))
                .map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => onSelect(tag.id)}
                  >
                    <Checkbox checked={false} className="mr-2" />
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
