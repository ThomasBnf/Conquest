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
import { type Filter, FilterLevelSchema } from "@conquest/zod/filters.schema";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useTab } from "./hooks/useTab";

type Props = {
  filter: Filter | undefined;
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

  if (!filter || filter.type !== "level") return null;

  const filterLevel = FilterLevelSchema.parse(filter);

  const handleSelect = (level: number) => {
    setOpenDropdown?.(false);
    setTimeout(() => {
      setOpen(false);
      setFilters((prevFilters) => {
        const exists = prevFilters.some((f) => f.id === filterLevel.id);
        const updatedFilters = exists
          ? prevFilters.map((f) =>
              f.id === filterLevel.id ? { ...filterLevel, value: level } : f,
            )
          : [...prevFilters, { ...filterLevel, value: level }];
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
          <Button variant="dropdown"> {getLevelLabel(filter.value)}</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          {commandContent}
        </PopoverContent>
      </Popover>
    );
  }

  return commandContent;
};
