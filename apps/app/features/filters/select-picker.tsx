import { LocaleBadge } from "@/components/custom/locale-badge";
import { useUser } from "@/context/userContext";
import { client } from "@/lib/rpc";
import { Button } from "@conquest/ui/button";
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
import { Skeleton } from "@conquest/ui/skeleton";
import { type Filter, FilterSelectSchema } from "@conquest/zod/filters.schema";
import { type Tag, TagSchema } from "@conquest/zod/tag.schema";
import { useQuery } from "@tanstack/react-query";
import { CommandLoading } from "cmdk";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useTab } from "./hooks/useTab";

type Props = {
  filter: Filter | undefined;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  setOpenDropdown?: Dispatch<SetStateAction<boolean>>;
  triggerButton?: boolean;
  handleUpdateNode?: (filters: Filter[]) => void;
};

export const SelectPicker = ({
  filter,
  setFilters,
  setOpenDropdown,
  triggerButton,
  handleUpdateNode,
}: Props) => {
  const { user } = useUser();
  const { setTab } = useTab();
  const [open, setOpen] = useState(false);

  const selectFilter = FilterSelectSchema.parse(filter);

  const { data: items, isLoading } = useQuery({
    queryKey: ["items", filter?.id],
    queryFn: async () => {
      switch (selectFilter.field) {
        case "locale": {
          const response = await client.api.members.locales.$get();

          return await response.json();
        }
        case "source": {
          const response = await client.api.activityTypes.sources.$get();

          return await response.json();
        }
        case "tags": {
          const response = await client.api.tags.$get({
            query: { workspace_id: user?.workspace_id ?? "" },
          });

          return TagSchema.array().parse(await response.json());
        }
        default:
          return [];
      }
    },
  });

  if (!filter || filter.type !== "select") return null;

  const filterSelect = FilterSelectSchema.parse(filter);

  const handleSelect = (item: string | Tag | null) => {
    if (!item) return;
    const value = typeof item === "string" ? item : item.id;

    setOpenDropdown?.(false);
    setTimeout(() => {
      setOpen(false);
      setFilters((prevFilters) => {
        const exists = prevFilters.some((f) => f.id === filterSelect.id);
        const updatedFilters = exists
          ? prevFilters.map((f) =>
              f.id === filterSelect.id ? { ...f, values: [value] } : f,
            )
          : [...prevFilters, { ...filterSelect, values: [value] }];

        handleUpdateNode?.(updatedFilters);
        setTab(undefined);
        return updatedFilters;
      });
    }, 100);
  };

  const commandContent = (
    <Command>
      <CommandInput placeholder="Search value..." />
      <CommandList>
        <CommandGroup>
          {isLoading ? (
            <CommandLoading>
              <Skeleton className="h-8 w-full" />
            </CommandLoading>
          ) : (
            <CommandEmpty>No values available</CommandEmpty>
          )}
          {!isLoading &&
            items?.map((item) => {
              if (!item) return null;

              const itemId = typeof item === "string" ? item : item.id;
              const isSelected = filter.values.includes(itemId);

              if (typeof item === "string") {
                return (
                  <CommandItem key={item} onSelect={() => handleSelect(item)}>
                    {filter.field === "locale" ? (
                      <LocaleBadge country={item} />
                    ) : (
                      item
                    )}
                  </CommandItem>
                );
              }

              return (
                <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} />
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                </CommandItem>
              );
            })}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (triggerButton) {
    const selectedItem =
      filter.values[0] &&
      items?.find((i) =>
        typeof i === "string"
          ? i === filter.values[0]
          : i?.id === filter.values[0],
      );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="dropdown">
            {isLoading ? (
              <Skeleton className="h-5 w-12" />
            ) : (
              selectedItem &&
              (typeof selectedItem === "string" ? (
                filter.field === "locale" ? (
                  <LocaleBadge
                    country={selectedItem}
                    className="border-none bg-transparent"
                  />
                ) : (
                  selectedItem
                )
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: selectedItem.color }}
                  />
                  <span>{selectedItem.name}</span>
                </div>
              ))
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          {commandContent}
        </PopoverContent>
      </Popover>
    );
  }

  return commandContent;
};
