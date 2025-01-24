import { WHO_OPTIONS } from "@/constant";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type {
  FilterActivity,
  WhoOptions,
} from "@conquest/zod/schemas/filters.schema";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
  handleUpdate: (option: WhoOptions) => void;
};

export const WhoPicker = ({ filter, handleUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const { who } = filter;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown">
          {who.replaceAll("_", " ").charAt(0).toUpperCase() +
            who.replaceAll("_", " ").slice(1)}
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
                    handleUpdate(option);
                    setOpen(false);
                  }}
                >
                  {option.replaceAll("_", " ").charAt(0).toUpperCase() +
                    option.replaceAll("_", " ").slice(1)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
