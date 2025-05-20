import { useFilters } from "@/context/filtersContext";
import { useCreateTag } from "@/features/tags/mutations/useCreateTag";
import { TagBadge } from "@/features/tags/tag-badge";
import { TagMenuDialog } from "@/features/tags/tag-menu-dialog";
import { trpc } from "@/server/client";
import { tableCompaniesParams, tableMembersParams } from "@/utils/tableParams";
import { Badge } from "@conquest/ui/badge";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Command,
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
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { cn } from "@conquest/ui/cn";
type Props<TData extends Member | Company> = {
  data: TData;
};

export const TagsCell = <TData extends Member | Company>({
  data,
}: Props<TData>) => {
  const { groupFilters } = useFilters();
  const { data: tags } = trpc.tags.list.useQuery();
  const [height, setHeight] = useState(0);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const utils = trpc.useUtils();
  const ref = useRef<HTMLDivElement>(null);

  const onUpdate = async (tags: string[]) => {
    if ("firstName" in data) {
      await updateMember({ ...data, tags });
    } else {
      await updateCompany({ ...data, tags });
    }
  };

  const createTag = useCreateTag({ tags: data.tags, onUpdate });
  const existingTag = tags?.find((tag) => tag.name === value);

  const isMember = "firstName" in data;
  const [{ search, id, desc }] = useQueryStates(
    isMember ? tableMembersParams : tableCompaniesParams,
  );

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
    onError: () => {
      toast.error("Failed to update member");
      utils.members.get.invalidate({ id: data.id });
    },
    onSettled: () => {
      utils.members.get.invalidate({ id: data.id });
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
    onError: (error) => {
      toast.error("Failed to update company");
      utils.companies.get.invalidate({ id: data.id });
    },
    onSettled: () => {
      utils.companies.get.invalidate({ id: data.id });
    },
  });

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(true);
    requestAnimationFrame(() => setHeight(ref.current?.offsetHeight ?? 0));
  };

  const onSelectTag = async (tagId: string) => {
    const hasTag = data.tags.includes(tagId);
    const newTags = hasTag
      ? data.tags.filter((id) => id !== tagId)
      : [...data.tags, tagId];

    if ("firstName" in data) {
      await updateMember({ ...data, tags: newTags });
    } else {
      await updateCompany({ ...data, tags: newTags });
    }
  };

  const onAddTag = () => {
    createTag({
      id: uuid(),
      externalId: null,
      name: value,
      color: "#0070f3",
      source: "Manual" as const,
      workspaceId: data.workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setValue("");
  };

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [data.tags]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              onDelete={() => onSelectTag(tag)}
              deletable={open}
            />
          ))}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[302px] shrink-0 rounded-t-none p-0 shadow-lg"
        sideOffset={height - 43}
        alignOffset={-1}
        align="start"
      >
        <Command loop>
          <CommandInput
            placeholder="Search tags..."
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
                      checked={data.tags.includes(tag.id)}
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
