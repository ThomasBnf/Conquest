import { addTagsCompanies } from "@/actions/members/addTagsCompanies";
import { addTagsMembers } from "@/actions/members/addTagsMembers";
import { removeTagsCompanies } from "@/actions/members/removeTagsCompanies";
import { removeTagsMembers } from "@/actions/members/removeTagsMembers";
import { listTags } from "@/client/tags/listTags";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TagBadge } from "../tags/tag-badge";

type Props = {
  id: string;
  initialTags: Tag[];
  table: "members" | "companies";
};

export const TagsCell = ({ id, initialTags, table }: Props) => {
  const { tags: allTags } = listTags();
  const [open, setOpen] = useState(false);
  const tags = useMemo(() => initialTags, [initialTags]);
  const queryClient = useQueryClient();

  const memberSliceTags = tags?.slice(0, 1);
  const remainingCount = tags?.length > 1 ? tags?.slice(1) : [];
  const filteredTags = allTags?.filter(
    (tag) => !tags?.some((t) => t.id === tag.id),
  );

  const onSelect = async (tagId: string) => {
    const hasTag = tags?.some((tag) => tag.id === tagId);
    const selectedTag = allTags?.find((tag) => tag.id === tagId);

    if (!selectedTag) return;

    if (hasTag) {
      if (table === "members") {
        const response = await removeTagsMembers({
          ids: [id],
          tags: [tagId],
        });

        if (response?.serverError) {
          toast.error(response.serverError);
          return;
        }
      } else if (table === "companies") {
        const response = await removeTagsCompanies({
          ids: [id],
          tags: [tagId],
        });

        if (response?.serverError) {
          toast.error(response.serverError);
          return;
        }
      }
    } else {
      if (table === "members") {
        const response = await addTagsMembers({
          ids: [id],
          tags: [tagId],
        });

        if (response?.serverError) {
          toast.error(response.serverError);
          return;
        }
      } else if (table === "companies") {
        const response = await addTagsCompanies({
          ids: [id],
          tags: [tagId],
        });

        if (response?.serverError) {
          toast.error(response.serverError);
          return;
        }
      }
    }

    queryClient.invalidateQueries({ queryKey: [table], exact: false });
    toast.success(hasTag ? "Tag removed" : "Tag added");
  };

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
            {tags?.length > 0 && (
              <>
                <CommandGroup>
                  {tags?.map((tag) => (
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
            {filteredTags && filteredTags?.length > 0 && (
              <CommandGroup>
                {filteredTags?.map((tag) => (
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
