import { useFilters } from "@/context/filtersContext";
import { useListLocales } from "@/features/members/hooks/useListLocale";
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

export const LocalePicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const { locales, isLoading } = useListLocales();
  const [values, setValues] = useState(filter.values);

  const onUpdateActivityLocale = (locale: string) => {
    setValues((prev) => {
      const updatedValues = prev.includes(locale)
        ? prev.filter((t) => t !== locale)
        : [...prev, locale];

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
          locales?.map((locale) => (
            <PopoverCheckboxItem
              key={locale}
              checked={values?.includes(locale)}
              onCheckedChange={() => onUpdateActivityLocale(locale)}
            >
              {locale}
            </PopoverCheckboxItem>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};
