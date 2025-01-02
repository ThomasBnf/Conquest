import { getLevelLabel } from "@/helpers/getLevelLabel";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Filter, FilterLevel } from "@conquest/zod/schemas/filters.schema";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useTab } from "./hooks/useTab";

type Props = {
  filter: FilterLevel | undefined;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdate: (filters: Filter[]) => void;
  setOpenDropdown?: Dispatch<SetStateAction<boolean>>;
  triggerButton?: boolean;
};

export const LevelPicker = ({
  filter,
  setFilters,
  setOpenDropdown,
  triggerButton,
  handleUpdate,
}: Props) => {
  const { setTab } = useTab();
  const [open, setOpen] = useState(false);

  const handleSelect = (level: number) => {
    if (!filter) return;

    setOpenDropdown?.(false);
    setTimeout(() => {
      setOpen(false);
      setFilters((prevFilters) => {
        const exists = prevFilters.some((f) => f.id === filter.id);
        const updatedFilters = exists
          ? prevFilters.map((f) =>
              f.id === filter.id ? { ...filter, value: level } : f,
            )
          : [...prevFilters, { ...filter, value: level }];
        handleUpdate(updatedFilters);
        setTab(undefined);
        return updatedFilters;
      });
    }, 100);
  };

  const commandContent = (
    <Command>
      <CommandInput placeholder="Search level..." />
      <CommandList>
        <CommandGroup>
          {Array.from({ length: 12 }, (_, i) => 12 - i).map((level) => (
            <CommandItem key={level} onSelect={() => handleSelect(level)}>
              {getLevelLabel(level)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (triggerButton) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="dropdown">
            {filter ? getLevelLabel(filter.value) : "Select level"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          {commandContent}
        </PopoverContent>
      </Popover>
    );
  }

  return commandContent;
};
