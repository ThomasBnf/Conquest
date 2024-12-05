import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { FilterActivity } from "@conquest/zod/filters.schema";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
  handleUpdateDate: (date: string) => void;
};

export const RelativePicker = ({ filter, handleUpdateDate }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown">in the last {filter.dynamic_date}</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandGroup>
              {RELATIVES.map((relative) => (
                <CommandItem
                  key={relative}
                  onSelect={() => {
                    handleUpdateDate(relative);
                    setOpen(false);
                  }}
                >
                  last {relative.replaceAll("_", " ")}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const RELATIVES = ["7 days", "30 days", "90 days", "365 days"];
