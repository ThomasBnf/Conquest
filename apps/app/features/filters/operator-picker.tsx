import { OPERATORS } from "@/constant";
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
import {
  BaseOperatorSchema,
  DateOperatorSchema,
  type Filter,
  FilterSchema,
  NumberOperatorSchema,
  type Operator,
} from "@conquest/zod/schemas/filters.schema";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: Filter;
};

export const OperatorPicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const [open, setOpen] = useState(false);

  const onUpdate = (operator: Operator) => {
    const newFilter = FilterSchema.parse({
      ...filter,
      operator,
    });

    onUpdateFilter(newFilter);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-fit">
          {filter.operator.replaceAll("_", " ")}
          <ChevronDown size={16} className="ml-auto text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command className="w-36" loop>
          <CommandList>
            <CommandInput placeholder="Search..." />
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
                    onUpdate(operator);
                    setOpen(false);
                  }}
                >
                  {operator.replaceAll("_", " ")}
                  {operator === filter.operator && (
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
