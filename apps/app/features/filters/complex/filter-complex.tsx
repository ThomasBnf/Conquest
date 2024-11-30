import { OPERATORS } from "@/constant/operators";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import {
  type Filter,
  type FilterActivity,
  FilterActivitySchema,
  NumberOperatorSchema,
  type Operator,
} from "@conquest/zod/filters.schema";
import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { OperatorPicker } from "../operator-picker";
import { QueryDialog } from "../query-dialog";
import { RelativePicker } from "../relative-picker";
import { ActivityTypePicker } from "./activity-type-picker";

type Props = {
  filter: FilterActivity;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdateNode?: (filters: Filter[]) => void;
};

export const FilterComplex = ({
  filter,
  setFilters,
  handleUpdateNode,
}: Props) => {
  if (!filter) return null;

  const filterActivity = FilterActivitySchema.parse(filter);

  const handleDeleteFilter = () => {
    setFilters((prevFilters) => {
      const newFilters = prevFilters.filter((f) => f.id !== filter.id);

      handleUpdateNode?.(newFilters);
      return newFilters;
    });
  };

  const handleUpdateOperator = (operator: Operator) => {
    if (filter.type === "activity") {
      const numberOperator = NumberOperatorSchema.parse(operator);

      setFilters((prevFilters) => {
        const newFilters = prevFilters.map((f) =>
          f.id === filter.id ? { ...filter, operator: numberOperator } : f,
        );

        handleUpdateNode?.(newFilters);
        return newFilters;
      });
    }
  };

  const handleApply = (query: string | number) => {
    if (!filter) return;

    setFilters((prev) => {
      const filterExists = prev.some((f) => f.id === filter.id);
      const updatedFilter = { ...filter, value: Number(query) };

      const newFilters = filterExists
        ? prev.map((f) => (f.id === filter.id ? updatedFilter : f))
        : [...prev, updatedFilter];

      handleUpdateNode?.(newFilters);
      return newFilters;
    });
  };

  const handleUpdateDate = (date: string) => {
    setFilters((prev) => {
      const newFilters = prev.map((f) =>
        f.id === filter.id ? { ...filter, date } : f,
      );

      handleUpdateNode?.(newFilters);
      return newFilters;
    });
  };

  return (
    <div className="flex h-8 items-center overflow-hidden rounded-md border">
      <p className="h-full place-content-center bg-muted px-2 first-letter:capitalize">
        Who did
      </p>
      <Separator orientation="vertical" />
      <ActivityTypePicker filter={filter} setFilters={setFilters} />
      <Separator orientation="vertical" />
      <OperatorPicker
        filter={filterActivity}
        operators={OPERATORS.filter(
          (operator) => NumberOperatorSchema.safeParse(operator).success,
        )}
        handleUpdateOperator={handleUpdateOperator}
      />
      <Separator orientation="vertical" />
      <QueryDialog
        type="number"
        filter={filter}
        handleApply={handleApply}
        triggerButton
      />
      <Separator orientation="vertical" />
      <RelativePicker
        filter={filterActivity}
        handleUpdateDate={handleUpdateDate}
      />
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        onClick={handleDeleteFilter}
        className="h-full rounded-none"
      >
        <X size={15} />
      </Button>
    </div>
  );
};
