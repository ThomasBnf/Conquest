import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { FilterActivity } from "@conquest/zod/schemas/filters.schema";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
};

export const FilterMenu = ({ filter }: Props) => {
  const [open, setOpen] = useState(false);
  const { onUpdateFilter } = useFilters();

  const hasChannel = filter.activityTypes.some((activityType) =>
    ["slack", "discord", "discourse"].some((channel) =>
      activityType.key.startsWith(channel),
    ),
  );

  const onUpdateDisplay = (
    field: "displayCount" | "displayDate" | "displayChannel",
  ) => {
    onUpdateFilter({
      ...filter,
      [field]: !filter[field],
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="size-8">
          <MoreHorizontal size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command className="w-fit">
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onUpdateDisplay("displayCount");
                }}
              >
                <Checkbox checked={filter.displayCount} className="mr-2" />
                Filter by count
              </CommandItem>
              {hasChannel && (
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    onUpdateDisplay("displayChannel");
                  }}
                >
                  <Checkbox checked={filter.displayChannel} className="mr-2" />
                  Filter by channel
                </CommandItem>
              )}
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onUpdateDisplay("displayDate");
                }}
              >
                <Checkbox checked={filter.displayDate} className="mr-2" />
                Filter by date
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
