import type { OPERATORS } from "@/constant/operators";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Filter, Operator } from "@conquest/zod/filters.schema";
import { useState } from "react";

type Props = {
  filter: Filter;
  operators: typeof OPERATORS;
  handleUpdateOperator: (operator: Operator) => void;
};

export const OperatorPicker = ({
  filter,
  operators,
  handleUpdateOperator,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown">{filter.operator}</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandGroup>
              {operators.map((operator) => (
                <CommandItem
                  key={operator}
                  onSelect={() => {
                    handleUpdateOperator(operator);
                    setOpen(false);
                  }}
                >
                  {operator}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
