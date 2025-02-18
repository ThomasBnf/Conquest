import { useFilters } from "@/context/filtersContext";
import { Input } from "@conquest/ui/input";
import {
  type FilterActivity,
  type FilterNumber,
  FilterNumberSchema,
} from "@conquest/zod/schemas/filters.schema";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterNumber | FilterActivity;
};

export const NumberInput = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const [value, setValue] = useState(Number(filter.value));

  const onUpdateNumber = (value: number) => {
    if (Number.isNaN(value)) return;

    setValue(value);
    const newFilter =
      filter.type === "number"
        ? FilterNumberSchema.parse({ ...filter, value })
        : { ...filter, value };

    onUpdateFilter(newFilter);
  };

  return (
    <div className="flex h-8 w-fit items-center divide-x overflow-hidden rounded-md border shadow-sm">
      <button
        type="button"
        className="flex size-8 shrink-0 items-center justify-center bg-muted transition-colors hover:bg-muted-hover"
        onClick={() => {
          if (value > 0) {
            onUpdateNumber(Number(value) - 1);
          }
        }}
      >
        <Minus size={16} />
      </button>
      <Input
        autoFocus
        variant="transparent"
        className="h-8 w-16"
        placeholder={filter.label}
        value={value}
        onChange={(e) => onUpdateNumber(Number(e.target.value))}
      />
      <button
        type="button"
        className="flex size-8 shrink-0 items-center justify-center bg-muted transition-colors hover:bg-muted-hover"
        onClick={() => onUpdateNumber(Number(value) + 1)}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
