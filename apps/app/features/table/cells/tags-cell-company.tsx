import { trpc } from "@/server/client";
import { tableParams } from "@/utils/tableParams";
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
import { Separator } from "@conquest/ui/separator";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Row } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { TagBadge } from "../../tags/tag-badge";

type Props = {
  row: Row<Company>;
};

export const TagsCellCompany = ({ row }: Props) => {
  const [{ search, idCompany, descCompany, page, pageSize }] =
    useQueryStates(tableParams);

  const { data: allTags } = trpc.tags.list.useQuery();
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync: updateCompany } = trpc.companies.update.useMutation({
    async onMutate(newData) {
      await utils.companies.list.cancel();

      const prevData = utils.companies.list.getData();

      utils.companies.list.setData(
        {
          search,
          id: idCompany,
          desc: descCompany,
          page,
          pageSize,
        },
        (old) =>
          old?.map((company) =>
            company.id === newData.id
              ? { ...company, tags: newData.tags ?? [] }
              : company,
          ),
      );

      return { prevData };
    },
    onError(_err, _newData, ctx) {
      utils.companies.list.setData(
        {
          search,
          id: idCompany,
          desc: descCompany,
          page,
          pageSize,
        },
        ctx?.prevData,
      );
    },
  });

  const tagsIds = row.original.tags.map((tag) => tag);
  const tagsToSelect = allTags?.filter((tag) => !tagsIds.includes(tag.id));
  const filteredTags = allTags?.filter((tag) => tagsIds.includes(tag.id));
  const sliceTags = filteredTags?.slice(0, 1);

  const onSelect = async (tagId: string) => {
    const hasTag = tagsIds.includes(tagId);

    if (hasTag) {
      await updateCompany({
        ...row.original,
        tags: tagsIds.filter((id) => id !== tagId),
      });
    } else {
      await updateCompany({
        ...row.original,
        tags: [...tagsIds, tagId],
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="h-full flex-1">
        <div
          className={cn(
            "flex h-full w-full flex-wrap items-center gap-1 p-2 hover:bg-muted",
            open && "bg-muted",
          )}
        >
          {sliceTags?.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {filteredTags && filteredTags?.length > 1 && (
            <span className="text-muted-foreground text-xs">
              +{filteredTags?.length - 1}
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
            {filteredTags && filteredTags?.length > 0 && (
              <CommandGroup>
                {filteredTags?.map((tag) => (
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
            )}
            {tagsToSelect && tagsToSelect?.length > 0 && (
              <>
                {filteredTags && filteredTags?.length > 0 && <Separator />}
                <CommandGroup>
                  {tagsToSelect.map((tag) => (
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
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
