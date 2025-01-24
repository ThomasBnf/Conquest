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
  handleUpdate: (display_count: boolean) => void;
};

export const FilterMenu = ({ filter, handleUpdate }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown">
          <MoreHorizontal size={15} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command className="w-36">
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  handleUpdate(!filter.display_count);
                  setOpen(false);
                }}
              >
                <Checkbox checked={filter.display_count} className="mr-2" />
                Filter by count
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
