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
  handleUpdate: (
    key: "display_count" | "display_date" | "display_channel",
    value: boolean,
  ) => void;
};

export const FilterMenu = ({ filter, handleUpdate }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown">
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
                  handleUpdate("display_count", !filter.display_count);
                }}
              >
                <Checkbox checked={filter.display_count} className="mr-2" />
                Filter by count
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  handleUpdate("display_date", !filter.display_date);
                }}
              >
                <Checkbox checked={filter.display_date} className="mr-2" />
                Filter by date
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  handleUpdate("display_channel", !filter.display_channel);
                }}
              >
                <Checkbox checked={filter.display_channel} className="mr-2" />
                Filter by channel
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
