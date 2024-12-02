import { useFilters } from "@/context/filtersContext";
import { useListLocalisation } from "@/features/members/hooks/useListLocalisation";
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

export const LocalisationPicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const { localisations, isLoading } = useListLocalisation();
  const [values, setValues] = useState(filter.values);

  const onUpdateLocalisation = (localisation: string) => {
    setValues((prev) => {
      const updatedValues = prev.includes(localisation)
        ? prev.filter((t) => t !== localisation)
        : [...prev, localisation];

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
            <span className="capitalize">
              {values.length > 1 ? `${values.length} localisations` : values[0]}
            </span>
          ) : (
            <span className="text-muted-foreground">Select localisation</span>
          )}
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44">
        {isLoading ? (
          <Skeleton className="h-5 w-full" />
        ) : (
          localisations?.map((localisation) => (
            <PopoverCheckboxItem
              key={localisation}
              checked={values?.includes(localisation)}
              onCheckedChange={() => onUpdateLocalisation(localisation)}
            >
              {localisation}
            </PopoverCheckboxItem>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};
