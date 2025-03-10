import { WHO_OPTIONS } from "@/constant";
import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { FilterActivity } from "@conquest/zod/schemas/filters.schema";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
};

export const WhoPicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const [open, setOpen] = useState(false);
  const { who } = filter;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {who.replaceAll("_", " ").charAt(0).toUpperCase() +
            who.replaceAll("_", " ").slice(1)}
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command className="w-36">
          <CommandList>
            <CommandGroup>
              {WHO_OPTIONS.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    onUpdateFilter({ ...filter, who: option });
                    setOpen(false);
                  }}
                >
                  {option.replaceAll("_", " ").charAt(0).toUpperCase() +
                    option.replaceAll("_", " ").slice(1)}
                  {who === option && <Check size={16} className="ml-auto" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
