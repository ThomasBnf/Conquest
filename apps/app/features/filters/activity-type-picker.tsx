import { useListActivityTypes } from "@/queries/hooks/useListActivityTypes";
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
} from "@conquest/zod/filters.schema";
import { CommandLoading } from "cmdk";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
  handleUpdateActivityTypes: ({
    key,
    name,
  }: {
    key: string;
    name: string;
  }) => void;
};

export const ActivityTypePicker = ({
  filter,
  handleUpdateActivityTypes,
}: Props) => {
  const { data, isLoading } = useListActivityTypes();
  const [open, setOpen] = useState(filter.activity_types.length === 0);

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

  const activityTypesList = filterActivity.activity_types;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown" className="shrink-0">
          {activityTypesList.length > 0 ? (
            activityTypesList.length > 4 ? (
              `${activityTypesList.length} activities`
            ) : (
              activityTypesList.map((type) => type.name).join(", ")
            )
          ) : (
            <p className="text-muted-foreground">Select</p>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-2xl p-0">
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
                      onSelect={() => handleUpdateActivityTypes({ key, name })}
                    >
                      <Checkbox
                        checked={filterActivity.activity_types.some(
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
