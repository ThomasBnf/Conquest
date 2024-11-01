import { useFilters } from "@/context/filtersContext";
import { Input } from "@conquest/ui/input";
import type { FilterCount } from "@conquest/zod/filters.schema";
import { useState } from "react";

type Props = {
  filter: FilterCount;
};

export const QueryInput = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const [value, setValue] = useState(filter.value);

  const onUpdateValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number.isNaN(Number(e.target.value))) return;

    const newValue = Number(e.target.value);

    setValue(newValue);
    onUpdateFilter({ ...filter, value: newValue });
  };

  return (
    <Input
      value={value}
      onChange={onUpdateValue}
      variant="transparent"
      className="flex h-8 w-full"
    />
  );
};
