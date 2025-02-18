import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type {
  DynamicDate,
  FilterActivity,
} from "@conquest/zod/schemas/filters.schema";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
};

export const DatePicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">in the last {filter.dynamic_date}</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandGroup>
              {RELATIVES.map((relative) => (
                <CommandItem
                  key={relative}
                  onSelect={() => {
                    onUpdateFilter({
                      ...filter,
                      dynamic_date: relative,
                    });
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

const RELATIVES: DynamicDate[] = ["7 days", "30 days", "90 days", "365 days"];
