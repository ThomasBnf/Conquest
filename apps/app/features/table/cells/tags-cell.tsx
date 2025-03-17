import { useFilters } from "@/context/filtersContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { tableParams } from "@/lib/tableParams";
import { trpc } from "@/server/client";
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
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Row } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useRef, useState } from "react";
import { TagBadge } from "../../tags/tag-badge";

type Props = {
  row: Row<Member>;
};

export const TagsCell = ({ row }: Props) => {
  const { groupFilters } = useFilters();
  const [{ search, idMember, descMember, page, pageSize }] =
    useQueryStates(tableParams);

  const { data: allTags } = trpc.tags.list.useQuery();
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);

  const utils = trpc.useUtils();
  const ref = useRef<HTMLDivElement>(null);
  const refCommand = useRef<HTMLDivElement>(null);

  const onClickOutside = () => {
    setFocus(false);
    setOpen(false);
  };

  useClickOutside(ref, onClickOutside);
  useClickOutside(refCommand, onClickOutside);

  const { mutateAsync: updateMember } = trpc.members.update.useMutation({
    async onMutate(newData) {
      await utils.members.list.cancel();

      const prevData = utils.members.list.getData();

      utils.members.list.setData(
        {
          search,
          id: idMember,
          desc: descMember,
          page,
          pageSize,
          groupFilters,
        },
        (old) =>
          old?.map((member) =>
            member.id === newData.id
              ? { ...member, tags: newData.tags ?? [] }
              : member,
          ),
      );

      return { prevData };
    },
    onError(_err, _newData, ctx) {
      utils.members.list.setData(
        {
          search,
          id: idMember,
          desc: descMember,
          page,
          pageSize,
          groupFilters,
        },
        ctx?.prevData,
      );
    },
  });

  const tagsIds = row.original.tags.map((tag) => tag);
  const tags = allTags?.filter((tag) => !tagsIds.includes(tag.id));
  const memberTags = allTags?.filter((tag) => tagsIds.includes(tag.id));

  const onSelect = async (tagId: string) => {
    const hasTag = tagsIds.includes(tagId);

    if (hasTag) {
      await updateMember({
        ...row.original,
        tags: tagsIds.filter((id) => id !== tagId),
      });
    } else {
      await updateMember({
        ...row.original,
        tags: [...tagsIds, tagId],
      });
    }
  };

  return (
    <Popover open={open}>
      <PopoverTrigger
        className={cn("h-full flex-1", focus ? "relative" : "overflow-hidden")}
        onClick={(e) => {
          e.preventDefault();
          if (open) {
            setOpen(false);
            setFocus(true);
            return;
          }

          if (!focus) setFocus(true);
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        <div
          ref={ref}
          className={cn(
            "flex h-full w-full items-center gap-1 p-2 hover:bg-muted",
            focus &&
              "relative z-20 h-fit min-h-full flex-wrap bg-muted ring-1 ring-main-400",
          )}
        >
          {memberTags?.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onDelete={() => onSelect(tag.id)}
              deletable={open}
            />
          ))}
        </div>
      </PopoverTrigger>
      <PopoverContent
        ref={refCommand}
        className="w-[--radix-popover-trigger-width] shrink-0 rounded-t-none p-0"
        sideOffset={ref.current?.offsetHeight! - 42}
        alignOffset={-1}
        align="start"
      >
        <Command loop>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {tags?.map((tag) => (
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
