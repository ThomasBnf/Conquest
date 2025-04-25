import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { ChevronDown, Trash2 } from "lucide-react";
import { AndOrPicker } from "./and-or-picker";
import { LevelPicker } from "./level-picker";
import { NumberInput } from "./number-input";
import { OperatorPicker } from "./operator-picker";
import { SelectPicker } from "./select-picker";
import { TextInput } from "./text-input";

type Props = {
  index: number;
  filter: Filter;
};

export const FilterPicker = ({ index, filter }: Props) => {
  const { onDeleteFilter } = useFilters();
  const { label, operator } = filter;

  const isEmpty = operator === "not_empty" || operator === "empty";

  return (
    <div className="flex items-center gap-1">
      {index === 0 ? (
        <p className="w-[70px] shrink-0 pl-1.5 text-muted-foreground">Where</p>
      ) : (
        <AndOrPicker />
      )}
      <p className="h-8 min-w-[115px] place-content-center text-nowrap rounded-md border bg-muted px-2">
        {label}
      </p>
      <OperatorPicker filter={filter} />
      {filter.type === "text" && !isEmpty && <TextInput filter={filter} />}
      {filter.type === "select" && !isEmpty && <SelectPicker filter={filter} />}
      {filter.type === "number" && !isEmpty && <NumberInput filter={filter} />}
      {filter.type === "level" && !isEmpty && <LevelPicker filter={filter} />}
      {isEmpty && (
        <div className="flex h-8 w-full max-w-[180px] items-center justify-between gap-1.5 rounded-md border px-3 opacity-40 shadow-sm">
          <p>Select</p>
          <ChevronDown size={16} />
        </div>
      )}
      <Button
        variant="outline"
        className="size-8"
        onClick={() => onDeleteFilter(filter)}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};
