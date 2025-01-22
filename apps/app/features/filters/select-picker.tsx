import { CountryBadge } from "@/components/custom/country-badge";
import { LanguageBadge } from "@/components/custom/language-badge";
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
        case "language": {
          const response = await client.api.members.locales.$get();
          const allLocales = await response.json();
          // Extract language codes and remove duplicates
          const uniqueLanguages = [
            ...new Set(
              allLocales
                .filter((locale): locale is string => Boolean(locale))
                .map((locale) => locale.split("_")[0]),
            ),
          ];
          return uniqueLanguages;
        }
        case "country": {
          const response = await client.api.members.locales.$get();

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
        const currentFilter = prevFilters.find((f) => f.id === filter.id);
        const parsedFilter = currentFilter
          ? FilterSelectSchema.parse(currentFilter)
          : undefined;
        const hasValue = parsedFilter?.values.includes(item);

        const updatedFilter = {
          ...filter,
          values: hasValue
            ? filter.values.filter((v) => v !== item)
            : [...filter.values, item],
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
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            items?.map((item) => {
              if (!item) return null;

              const parseItem = typeof item === "string" ? item : item.id;
              const isSelected = filter?.values.includes(parseItem);

              const renderBadge = () => {
                switch (filter?.field) {
                  case "country":
                    return (
                      <CountryBadge locale={parseItem} variant="transparent" />
                    );
                  case "source":
                    return (
                      <SourceBadge
                        source={parseItem as Source}
                        variant="transparent"
                      />
                    );
                  case "language":
                    return (
                      <LanguageBadge locale={parseItem} variant="transparent" />
                    );
                  default:
                    return <TagBadge tag={item as Tag} />;
                }
              };

              return (
                <CommandItem
                  key={parseItem}
                  onSelect={() =>
                    filter?.field === "tags"
                      ? handleTagSelect(item as Tag)
                      : handleSelect(parseItem)
                  }
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} />
                    {renderBadge()}
                  </div>
                </CommandItem>
              );
            })
          )}
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
                    {selectedItems.length} {filter.label}s
                  </p>
                ) : (
                  selectedItems.map((item) =>
                    typeof item === "string" ? (
                      <div key={item}>
                        {filter.field === "country" ? (
                          <CountryBadge locale={item} variant="transparent" />
                        ) : filter.field === "language" ? (
                          <LanguageBadge locale={item} variant="transparent" />
                        ) : filter.field === "source" ? (
                          <SourceBadge source={item as Source} />
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
