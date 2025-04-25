import { useFilters } from "@/context/filtersContext";
import { trpc } from "@/server/client";
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
  type FilterActivity,
  FilterActivitySchema,
} from "@conquest/zod/schemas/filters.schema";
import { CommandLoading } from "cmdk";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
};

export const ActivityTypePicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = trpc.activityTypes.list.useQuery();

  const filterActivity = FilterActivitySchema.parse(filter);

  const activityTypes = data
    ?.sort((a, b) => a.source.localeCompare(b.source))
    .reduce(
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

  const activityTypesList = filterActivity.activityTypes;

  const onUpdateActivityTypes = (key: string, name: string) => {
    const isAlreadySelected = filterActivity.activityTypes.some(
      (type) => type.key === key,
    );

    const updatedActivityTypes = isAlreadySelected
      ? filterActivity.activityTypes.filter((type) => type.key !== key)
      : [...filterActivity.activityTypes, { key, name }];

    onUpdateFilter({
      ...filter,
      activityTypes: updatedActivityTypes,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {activityTypesList.length === 0 ? (
            <span className="text-muted-foreground">Select activity</span>
          ) : (
            <span>
              {activityTypesList.length < 3
                ? activityTypesList.map((type) => type.name).join(", ")
                : `${activityTypesList.length} activities selected`}
            </span>
          )}
          <ChevronDown size={16} className="text-muted-foreground" />
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
            <CommandGroup>
              {!isLoading && (
                <CommandItem
                  onSelect={() =>
                    onUpdateActivityTypes("anyActivity", "Any activity")
                  }
                >
                  <Checkbox
                    checked={filterActivity.activityTypes.some(
                      (type) => type.key === "anyActivity",
                    )}
                    className="mr-2"
                  />
                  Any activity
                </CommandItem>
              )}
            </CommandGroup>
            {activityTypes &&
              Object.entries(activityTypes).map(([source, types]) => (
                <CommandGroup key={source} heading={source}>
                  {Object.entries(types).map(([key, name]) => (
                    <CommandItem
                      key={key}
                      onSelect={() => onUpdateActivityTypes(key, name)}
                    >
                      <Checkbox
                        checked={filterActivity.activityTypes.some(
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
