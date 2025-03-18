import { useFilters } from "@/context/filtersContext";
import { TagBadge } from "@/features/tags/tag-badge";
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
import { useEffect, useRef, useState } from "react";

type Props = {
  row: Row<Member>;
};

export const TagsCell = ({ row }: Props) => {
  const { data: tags } = trpc.tags.list.useQuery();
  const { groupFilters } = useFilters();
  const [{ search, idMember, descMember, page, pageSize }] =
    useQueryStates(tableParams);

  const memberTags = row.original.tags;

  const [height, setHeight] = useState(0);
  const [open, setOpen] = useState(false);

  const utils = trpc.useUtils();
  const ref = useRef<HTMLDivElement>(null);
  const refDiv = useRef<HTMLDivElement>(null);

  const queryParams = {
    search,
    id: idMember,
    desc: descMember,
    page,
    pageSize,
    groupFilters,
  };

  const { mutateAsync: updateMember } = trpc.members.update.useMutation({
    onMutate: async (newData) => {
      await utils.members.list.cancel();
      const prevData = utils.members.list.getData();

      utils.members.list.setData(queryParams, (old) =>
        old?.map((member) =>
          member.id === newData.id ? { ...member, tags: newData.tags } : member,
        ),
      );

      return { prevData };
    },
    onError(_, __, ctx) {
      utils.members.list.setData(queryParams, ctx?.prevData);
    },
  });

  const onSelect = async (tagId: string) => {
    const hasTag = memberTags.includes(tagId);

    if (hasTag) {
      const newTags = memberTags.filter((id) => id !== tagId);
      await updateMember({ ...row.original, tags: newTags });
    } else {
      const newTags = [...memberTags, tagId];
      await updateMember({ ...row.original, tags: newTags });
    }
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(true);
    requestAnimationFrame(() => setHeight(ref.current?.offsetHeight ?? 0));
  };

  useClickOutside(refDiv, () => setOpen(false));

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [memberTags]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  return (
    <div ref={refDiv} className="flex h-full w-full">
      <Popover open={open}>
        <PopoverTrigger
          className={cn(
            "h-full flex-1 focus:outline-none",
            open ? "relative" : "overflow-hidden",
          )}
          onClick={onClick}
        >
          <div
            ref={ref}
            className={cn(
              "flex h-full w-full items-center gap-1 p-2 hover:bg-muted",
              open &&
                "relative z-20 h-fit min-h-full w-[300px] flex-wrap bg-muted ring-1 ring-main-400",
            )}
          >
            {memberTags?.map((tag) => (
              <TagBadge
                key={tag}
                tag={tags?.find((t) => t.id === tag)}
                onDelete={() => onSelect(tag)}
                deletable={open}
              />
            ))}
          </div>
        </PopoverTrigger>
        <PopoverContent
          portal={false}
          className="w-[calc(var(--radix-popover-trigger-width)_+_2px)] shrink-0 rounded-t-none p-0"
          sideOffset={height - 42}
          alignOffset={-1}
          align="start"
        >
          <Command loop>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags
                  ?.filter((tag) => !memberTags.includes(tag.id))
                  ?.map((tag) => (
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
    </div>
  );
};
