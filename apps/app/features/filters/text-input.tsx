import { useFilters } from "@/context/filtersContext";
import { Input } from "@conquest/ui/input";
import {
  type FilterText,
  FilterTextSchema,
} from "@conquest/zod/schemas/filters.schema";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

type Props = {
  filter: FilterText;
};

export const TextInput = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const [value, setValue] = useState(filter.value);
  const [debouncedValue] = useDebounce(value, 1000);

  const onUpdateText = () => {
    const newFilter = FilterTextSchema.parse({
      ...filter,
      value,
    });

    onUpdateFilter(newFilter);
  };

  useEffect(() => {
    setValue(debouncedValue);
  }, [debouncedValue]);

  return (
    <Input
      autoFocus
      className="h-8 max-w-[180px]"
      placeholder={filter.label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onUpdateText();
        }

        if (e.key === "Escape") {
          onUpdateText();
        }
      }}
      onBlur={onUpdateText}
    />
  );
};
