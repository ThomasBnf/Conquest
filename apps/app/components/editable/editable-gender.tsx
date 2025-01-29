import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Gender } from "@conquest/zod/enum/gender.enum";
import { useState } from "react";

type Props = {
  gender: string | null;
  onUpdate: (value: string | null) => void;
};

export const EditableGender = ({ gender, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(gender);

  const onUpdateGender = (gender: Gender) => {
    setValue(gender);
    onUpdate(gender);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-[7px]"
          classNameSpan="justify-start "
        >
          {value
            ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
            : "Select gender"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[233px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem value="Male" onSelect={() => onUpdateGender("MALE")}>
                Male
              </CommandItem>
              <CommandItem
                value="Female"
                onSelect={() => onUpdateGender("FEMALE")}
              >
                Female
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
