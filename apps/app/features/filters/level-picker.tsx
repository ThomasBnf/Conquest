import { useFilters } from "@/context/filtersContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
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
import type { FilterLevel } from "@conquest/zod/schemas/filters.schema";
import type { Level } from "@conquest/zod/schemas/level.schema";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterLevel;
};

export const LevelPicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const { value } = filter;
  const [open, setOpen] = useState(false);

  const { data: levels, isLoading } = trpc.levels.getAllLevels.useQuery();
  const currentLevel = levels?.find((level) => level.number === value);

  const onSelect = (level: Level) => {
    setOpen(false);
    onUpdateFilter({ ...filter, value: level.number });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="min-w-[180px] justify-between"
          classNameSpan="text-start justify-between text-nowrap"
        >
          {currentLevel ? (
            <span>
              {currentLevel.number} • {currentLevel.name}
            </span>
          ) : (
            <span className="text-muted-foreground">Select</span>
          )}
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-fit p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList className="max-h-[450px]">
            {!isLoading && <CommandEmpty>No sources found.</CommandEmpty>}
            <CommandGroup>
              {isLoading && <Skeleton className="h-8 w-full" />}
              {levels?.map((level) => (
                <CommandItem
                  key={level.id}
                  value={level.id}
                  onSelect={() => onSelect(level)}
                >
                  {level.number} • {level.name}
                  {value === level.number && (
                    <Check size={16} className="ml-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
