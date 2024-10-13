import { Button } from "@conquest/ui/button";
import {
  Popover,
  PopoverCheckboxItem,
  PopoverContent,
  PopoverTrigger,
} from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import { useFilters } from "context/filtersContext";
import { useListTypes } from "hooks/useListTypes";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { FilterSelect } from "schemas/filters.schema";

type Props = {
  filter: FilterSelect;
};

export const TypePicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const { types, isLoading } = useListTypes();
  const [values, setValues] = useState(filter.values);

  const onUpdateActivityType = (type: string) => {
    setValues((prev) => {
      const updatedValues = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];

      onUpdateFilter({
        ...filter,
        values: updatedValues,
      });

      return updatedValues;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="dropdown" className="w-full rounded-none">
          {values.length > 0 ? (
            <span className="capitalize">
              {values.length > 1 ? `${values.length} types` : values[0]}
            </span>
          ) : (
            <span className="text-muted-foreground">Select type</span>
          )}
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44">
        {isLoading ? (
          <Skeleton className="h-5 w-full" />
        ) : (
          types?.map((type) => (
            <PopoverCheckboxItem
              key={type}
              checked={filter.values?.includes(type)}
              onCheckedChange={() => onUpdateActivityType(type)}
            >
              {type}
            </PopoverCheckboxItem>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};
