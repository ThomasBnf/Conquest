import { OPERATORS } from "@/constant";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import {
  BaseOperatorSchema,
  DateOperatorSchema,
  type Filter,
  NumberOperatorSchema,
  type Operator,
} from "@conquest/zod/filters.schema";
import { useState } from "react";

type Props = {
  filter: Filter;
  handleUpdate: (operator: Operator) => void;
};

export const OperatorPicker = ({ filter, handleUpdate }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown">
          {filter.operator.replaceAll("_", " ")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command className="w-28">
          <CommandList>
            <CommandGroup>
              {OPERATORS.filter((operator) => {
                switch (filter.type) {
                  case "number":
                    return operator in NumberOperatorSchema.Values;
                  case "level":
                    return operator in NumberOperatorSchema.Values;
                  case "date":
                    return operator in DateOperatorSchema.Values;
                  case "activity":
                    return operator in NumberOperatorSchema.Values;
                  default:
                    return operator in BaseOperatorSchema.Values;
                }
              }).map((operator) => (
                <CommandItem
                  key={operator}
                  onSelect={() => {
                    handleUpdate(operator);
                    setOpen(false);
                  }}
                >
                  {operator.replaceAll("_", " ")}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
