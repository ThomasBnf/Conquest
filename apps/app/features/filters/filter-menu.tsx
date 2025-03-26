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

  const hasChannel = filter.activity_types.some((activityType) =>
    ["Slack", "Discord", "Discourse"].includes(activityType.key),
  );

  const onUpdateDisplay = (
    field: "display_count" | "display_date" | "display_channel",
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
                  onUpdateDisplay("display_count");
                }}
              >
                <Checkbox checked={filter.display_count} className="mr-2" />
                Filter by count
              </CommandItem>
              {hasChannel && (
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    onUpdateDisplay("display_channel");
                  }}
                >
                  <Checkbox checked={filter.display_channel} className="mr-2" />
                  Filter by channel
                </CommandItem>
              )}
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onUpdateDisplay("display_date");
                }}
              >
                <Checkbox checked={filter.display_date} className="mr-2" />
                Filter by date
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
