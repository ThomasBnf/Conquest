import { useFilters } from "@/context/filtersContext";
import { TagBadge } from "@/features/tags/tag-badge";
import { useClickOutside } from "@/hooks/useClickOutside";
import { trpc } from "@/server/client";
import { tableCompaniesParams, tableMembersParams } from "@/utils/tableParams";
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
import { Company } from "@conquest/zod/schemas/company.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";

type Props<TData extends Member | Company> = {
  data: TData;
  className?: string;
};

export const TagsCell = <TData extends Member | Company>({
  data,
  className,
}: Props<TData>) => {
  const { groupFilters } = useFilters();
  const { data: tags } = trpc.tags.list.useQuery();
  const [height, setHeight] = useState(0);
  const [open, setOpen] = useState(false);

  const isMember = "first_name" in data;
  const [{ search, id, desc }] = useQueryStates(
    isMember ? tableMembersParams : tableCompaniesParams,
  );

  const utils = trpc.useUtils();
  const ref = useRef<HTMLDivElement>(null);
  const refDiv = useRef<HTMLDivElement>(null);

  const { mutateAsync: updateMember } = trpc.members.update.useMutation({
    onMutate: async (newData) => {
      await utils.members.list.cancel();
      const prevData = utils.members.list.getInfiniteData();

      utils.members.list.setInfiniteData(
        { search, id, desc, groupFilters },
        (old) => {
          if (!old) return;

          const newPages = old.pages.map((page) =>
            page.map((member) =>
              member.id === newData.id
                ? { ...member, tags: newData.tags }
                : member,
            ),
          );

          return {
            ...old,
            pages: newPages,
          };
        },
      );

      return { prevData };
    },
  });

  const { mutateAsync: updateCompany } = trpc.companies.update.useMutation({
    onMutate: async (newData) => {
      await utils.companies.list.cancel();
      const prevData = utils.companies.list.getInfiniteData();

      utils.companies.list.setInfiniteData({ search, id, desc }, (old) => {
        if (!old) return;

        const newPages = old.pages.map((page) =>
          page.map((company) =>
            company.id === newData.id
              ? { ...company, tags: newData.tags }
              : company,
          ),
        );

        return {
          ...old,
          pages: newPages,
        };
      });

      return { prevData };
    },
  });

  const onSelect = async (tagId: string) => {
    const hasTag = data.tags.includes(tagId);
    const newTags = hasTag
      ? data.tags.filter((id) => id !== tagId)
      : [...data.tags, tagId];

    if ("first_name" in data) {
      await updateMember({ ...data, tags: newTags });
    } else {
      await updateCompany({ ...data, tags: newTags });
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
  }, [data.tags]);

  return (
    <div ref={refDiv} className={cn("flex h-full w-full", className)}>
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
                "absolute top-0 z-20 h-fit min-h-full w-[300px] flex-wrap bg-muted ring-1 ring-main-400",
            )}
          >
            {data.tags?.map((tag) => (
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
          className="w-[300px] shrink-0 rounded-t-none p-0 shadow-lg"
          sideOffset={height - 41}
          alignOffset={-1}
          align="start"
        >
          <Command loop>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags
                  ?.filter((tag) => !data.tags.includes(tag.id))
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
