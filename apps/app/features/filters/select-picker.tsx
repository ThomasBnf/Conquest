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
import type { Tag } from "@conquest/zod/tag.schema";
import { CommandLoading } from "cmdk";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useListSources } from "../activities/hooks/useListSources";
import { useListTags } from "../tags/hooks/useListTags";
import { useListLocalisations } from "./hooks/useListLocalisations";
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
  const { setTab } = useTab();

  if (!filter || filter.type !== "select") return null;

  const [open, setOpen] = useState(false);

  const { sources, isLoading } = useListSources();
  const { localisations, isLoading: isLoadingLocs } = useListLocalisations();
  const { tags, isLoading: isLoadingTags } = useListTags();

  const loading = isLoading || isLoadingLocs || isLoadingTags;

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

  const listItems = () => {
    switch (filter.field) {
      case "source": {
        return sources;
      }
      case "localisation": {
        return localisations;
      }
      case "tags": {
        return tags;
      }
    }
  };

  const items = listItems();

  const commandContent = (
    <Command>
      <CommandInput placeholder="Search value..." />
      <CommandList>
        <CommandGroup>
          {loading ? (
            <CommandLoading>
              <Skeleton className="h-8 w-full" />
            </CommandLoading>
          ) : (
            <CommandEmpty>No values available</CommandEmpty>
          )}
          {!loading &&
            items?.map((item) => {
              if (!item) return;
              return (
                <CommandItem
                  key={typeof item === "string" ? item : item.id}
                  onSelect={() => handleSelect(item)}
                >
                  {typeof item === "string" ? (
                    item
                  ) : (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox checked={filter.values.includes(item.id)} />
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </div>
                  )}
                </CommandItem>
              );
            })}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (triggerButton) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="dropdown">
            {loading ? (
              <Skeleton className="h-5 w-12" />
            ) : (
              filter.values.map((value) => {
                if (!value || !items) return null;

                const item = items.find((i) => {
                  if (typeof i === "string") return i === value;
                  return i?.id === value;
                });

                if (!item) return null;

                return typeof item === "string" ? (
                  item
                ) : (
                  <div key={item.id} className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                );
              })
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
