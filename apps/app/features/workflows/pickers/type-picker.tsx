import { useFilters } from "@/context/filtersContext";
import { useListKeys } from "@/features/activities/hooks/useListTypes";
import { Button } from "@conquest/ui/button";
import {
  Popover,
  PopoverCheckboxItem,
  PopoverContent,
  PopoverTrigger,
} from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import type { FilterSelect } from "@conquest/zod/filters.schema";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterSelect;
};

export const TypePicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const { keys, isLoading } = useListKeys();
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
        <Button
          variant="dropdown"
          className="w-full rounded-none"
          classNameSpan="justify-between"
        >
          {values.length > 0 ? (
            <span>
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
          keys?.map((key) => (
            <PopoverCheckboxItem
              key={key}
              checked={filter.values?.includes(key)}
              onCheckedChange={() => onUpdateActivityType(key)}
            >
              {key}
            </PopoverCheckboxItem>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};
