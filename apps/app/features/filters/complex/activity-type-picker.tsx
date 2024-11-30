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
import {
  type Filter,
  type FilterActivity,
  FilterActivitySchema,
} from "@conquest/zod/filters.schema";
import { CommandLoading } from "cmdk";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useListActivityTypes } from "../hooks/useListActivityTypes";

type Props = {
  filter: FilterActivity;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
};

export const ActivityTypePicker = ({ filter, setFilters }: Props) => {
  const { data, isLoading } = useListActivityTypes();
  const [open, setOpen] = useState(filter.activity_type.length === 0);

  const filterActivity = FilterActivitySchema.parse(filter);

  const activityTypes = data?.reduce(
    (acc, activityType) => {
      const source = activityType.source || "Other";
      if (!acc[source]) {
        acc[source] = {};
      }
      acc[source][activityType.key] = activityType.name;
      return acc;
    },
    {} as Record<string, Record<string, string>>,
  );

  const handleUpdateFilter = ({
    key,
    name,
  }: {
    key: string;
    name: string;
  }) => {
    const isActivityTypeSelected = filterActivity.activity_type.some(
      (type) => type.key === key,
    );

    setFilters((filters) =>
      filters.map((_filter) =>
        _filter.id === filter.id
          ? {
              ..._filter,
              activity_type: isActivityTypeSelected
                ? filterActivity.activity_type.filter(
                    (type) => type.key !== key,
                  )
                : [...filterActivity.activity_type, { key, name }],
            }
          : _filter,
      ),
    );
  };

  const hasActivityTypes = filterActivity.activity_type.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown">
          {hasActivityTypes > 0 ? (
            `${hasActivityTypes} ${hasActivityTypes > 1 ? "activities" : "activity"}`
          ) : (
            <p className="text-muted-foreground">Select</p>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            {isLoading && (
              <CommandGroup>
                <CommandLoading>
                  <Skeleton className="h-8 w-full" />
                </CommandLoading>
              </CommandGroup>
            )}
            {!isLoading && !activityTypes && (
              <CommandGroup>
                <CommandEmpty>No activity types found.</CommandEmpty>
              </CommandGroup>
            )}
            {activityTypes &&
              Object.entries(activityTypes).map(([source, types]) => (
                <CommandGroup key={source} heading={source}>
                  {Object.entries(types).map(([key, name]) => (
                    <CommandItem
                      key={key}
                      onSelect={() => handleUpdateFilter({ key, name })}
                    >
                      <Checkbox
                        checked={filterActivity.activity_type.some(
                          (type) => type.key === key,
                        )}
                        className="mr-2"
                      />
                      {name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
