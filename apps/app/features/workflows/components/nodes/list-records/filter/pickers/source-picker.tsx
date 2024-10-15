import { Button } from "@conquest/ui/button";
import {
  Popover,
  PopoverCheckboxItem,
  PopoverContent,
  PopoverTrigger,
} from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import type { FilterSelect } from "@conquest/zod/filters.schema";
import { useFilters } from "context/filtersContext";
import { useListSources } from "hooks/useListSources";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterSelect;
};

export const SourcePicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const { sources, isLoading } = useListSources();
  const [values, setValues] = useState(filter.values);

  const onUpdateActivitySource = (source: string) => {
    setValues((prev) => {
      const updatedValues = prev.includes(source)
        ? prev.filter((t) => t !== source)
        : [...prev, source];

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
              {values.length > 1 ? `${values.length} sources` : values[0]}
            </span>
          ) : (
            <span className="text-muted-foreground">Select source</span>
          )}
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44">
        {isLoading ? (
          <Skeleton className="h-5 w-full" />
        ) : (
          sources?.map((source) => (
            <PopoverCheckboxItem
              key={source}
              checked={filter.values?.includes(source)}
              onCheckedChange={() => onUpdateActivitySource(source)}
            >
              {source}
            </PopoverCheckboxItem>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};
