import { LocationBadge } from "@/components/custom/location-badge";
import { SourceBadge } from "@/components/custom/source-badge";
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
import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type Filter,
  type FilterSelect,
  FilterSelectSchema,
} from "@conquest/zod/schemas/filters.schema";
import { type Tag, TagSchema } from "@conquest/zod/schemas/tag.schema";
import { useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { TagBadge } from "../tags/tag-badge";
import { useTab } from "./hooks/useTab";

type Props = {
  filter: FilterSelect | undefined;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  setOpenDropdown?: Dispatch<SetStateAction<boolean>>;
  handleUpdate?: (filters: Filter[]) => void;
  triggerButton?: boolean;
};

export const SelectPicker = ({
  filter,
  setFilters,
  setOpenDropdown,
  triggerButton,
  handleUpdate,
}: Props) => {
  const { setTab } = useTab();
  const [open, setOpen] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["items", filter?.id],
    queryFn: async () => {
      const selectFilter = FilterSelectSchema.parse(filter);
      switch (selectFilter.field) {
        case "location": {
          const response = await client.api.members.locations.$get();

          return await response.json();
        }
        case "source": {
          const response = await client.api.activityTypes.sources.$get();

          return await response.json();
        }
        case "tags": {
          const response = await client.api.tags.$get();

          return TagSchema.array().parse(await response.json());
        }
        default:
          return [];
      }
    },
  });

  const handleSelect = (item: string) => {
    if (!item || !filter) return;

    setOpenDropdown?.(false);
    setTimeout(() => {
      setOpen(false);
      setFilters((prevFilters) => {
        const exists = prevFilters.some((f) => f.id === filter.id);
        const updatedFilter = { ...filter, values: [item] };

        const updatedFilters = exists
          ? prevFilters.map((f) => (f.id === filter.id ? updatedFilter : f))
          : [...prevFilters, updatedFilter];

        handleUpdate?.(updatedFilters);
        setTab(undefined);
        return updatedFilters;
      });
    }, 100);
  };

  const handleTagSelect = (tag: Tag) => {
    if (!filter) return;

    setOpenDropdown?.(false);
    setTimeout(() => {
      setOpen(false);
      setFilters((prevFilters) => {
        const exists = prevFilters.some((f) => f.id === filter.id);
        const currentFilter = prevFilters.find((f) => f.id === filter.id);
        const parsedFilter = currentFilter
          ? FilterSelectSchema.parse(currentFilter)
          : undefined;
        const hasTag = parsedFilter?.values.includes(tag.id);

        const updatedFilter = {
          ...filter,
          values: hasTag
            ? filter.values.filter((v) => v !== tag.id)
            : [...filter.values, tag.id],
        };

        const updatedFilters = exists
          ? prevFilters.map((f) => (f.id === filter.id ? updatedFilter : f))
          : [...prevFilters, updatedFilter];

        handleUpdate?.(updatedFilters);
        setTab(undefined);
        return updatedFilters;
      });
    }, 100);
  };

  const commandContent = (
    <Command>
      <CommandInput autoFocus placeholder="Search value..." />
      <CommandList>
        {!isLoading && (
          <CommandEmpty>No {filter?.label.toLowerCase()}s found</CommandEmpty>
        )}
        <CommandGroup>
          {isLoading && <Skeleton className="h-8 w-full" />}
          {!isLoading &&
            items?.map((item) => {
              if (!item) return null;

              const itemId = typeof item === "string" ? item : item.id;
              const isSelected = filter?.values.includes(itemId);

              if (typeof item === "string") {
                return (
                  <CommandItem key={item} onSelect={() => handleSelect(item)}>
                    {filter?.field === "location" ? (
                      <LocationBadge
                        location={item}
                        className="border-none bg-transparent p-0"
                      />
                    ) : filter?.field === "source" ? (
                      <SourceBadge
                        source={item as Source}
                        className="border-none bg-transparent p-0"
                      />
                    ) : (
                      item
                    )}
                  </CommandItem>
                );
              }
              return (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleTagSelect(item)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} />
                    <TagBadge tag={item} />
                  </div>
                </CommandItem>
              );
            })}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (triggerButton && filter) {
    const selectedItems = filter.values
      .map((value) =>
        items?.find((i) =>
          typeof i === "string" ? i === value : i?.id === value,
        ),
      )
      .filter(Boolean);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="dropdown">
            {isLoading ? (
              <Skeleton className="h-5 w-12" />
            ) : selectedItems.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedItems.length > 1 ? (
                  <p className="lowercase">
                    {selectedItems.length} {filter.label}
                  </p>
                ) : (
                  selectedItems.map((item) =>
                    typeof item === "string" ? (
                      <div key={item}>
                        {filter.field === "location" ? (
                          <LocationBadge
                            location={item}
                            className="border-none bg-transparent p-0"
                          />
                        ) : filter.field === "source" ? (
                          <SourceBadge
                            source={item as Source}
                            className="border-none bg-transparent p-0"
                          />
                        ) : (
                          item
                        )}
                      </div>
                    ) : (
                      item && <TagBadge key={item.id} tag={item} transparent />
                    ),
                  )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Select</p>
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
