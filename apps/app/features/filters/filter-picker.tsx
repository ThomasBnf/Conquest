import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import {
  type Filter,
  FilterSchema,
  type Operator,
} from "@conquest/zod/schemas/filters.schema";
import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { InputDialog } from "./input-dialog";
import { LevelPicker } from "./level-picker";
import { OperatorPicker } from "./operator-picker";
import { SelectPicker } from "./select-picker";

type Props = {
  filter: Filter;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdate?: (filters: Filter[]) => void;
};

export const FilterPicker = ({ filter, setFilters, handleUpdate }: Props) => {
  if (!filter) return null;

  const handleDeleteFilter = () => {
    setFilters((prevFilters) => {
      const newFilters = prevFilters.filter((f) => f.id !== filter.id);

      handleUpdate?.(newFilters);
      return newFilters;
    });
  };

  const handleUpdateOperator = (operator: Operator) => {
    setFilters((prevFilters) => {
      const newFilters = prevFilters.map((f) => {
        if (f.id !== filter.id) return f;

        const parsedFilter = FilterSchema.parse(f);

        return {
          ...parsedFilter,
          operator,
        };
      });

      const validatedFilters = FilterSchema.array().parse(newFilters);
      handleUpdate?.(validatedFilters);
      return validatedFilters;
    });
  };

  const handleApply = (query: string | number) => {
    if (filter.type === "text") {
      setFilters((prevFilters) => {
        const newFilters = prevFilters.map((f) =>
          f.id === filter.id ? { ...filter, value: query.toString() } : f,
        );

        handleUpdate?.(newFilters);
        return newFilters;
      });
    }

    if (filter.type === "number") {
      setFilters((prevFilters) => {
        const newFilters = prevFilters.map((f) =>
          f.id === filter.id ? { ...filter, value: Number(query) } : f,
        );

        handleUpdate?.(newFilters);
        return newFilters;
      });
    }
  };

  return (
    <div className="flex h-8 w-fit items-center overflow-hidden rounded-md border">
      <p className="h-full place-content-center bg-muted px-1">
        {filter.label}
      </p>
      <Separator orientation="vertical" />
      <OperatorPicker filter={filter} handleUpdate={handleUpdateOperator} />
      <Separator orientation="vertical" />
      {filter.operator !== "not_empty" && filter.operator !== "empty" && (
        <>
          {filter.type === "select" ? (
            <SelectPicker
              filter={filter}
              setFilters={setFilters}
              handleUpdate={handleUpdate}
              triggerButton
            />
          ) : filter.type === "text" ? (
            <InputDialog
              filter={filter}
              handleApply={handleApply}
              type="text"
              triggerButton
            />
          ) : filter.type === "number" ? (
            <InputDialog
              filter={filter}
              handleApply={handleApply}
              type="number"
              triggerButton
            />
          ) : filter.type === "level" ? (
            <LevelPicker
              filter={filter}
              setFilters={setFilters}
              handleUpdate={handleUpdate}
              triggerButton
            />
          ) : filter.type === "date" ? (
            <p className="px-1">{filter.days}</p>
          ) : null}
          <Separator orientation="vertical" />
        </>
      )}
      <Button
        variant="ghost"
        onClick={handleDeleteFilter}
        className="h-full rounded-none px-1"
      >
        <X size={15} />
      </Button>
    </div>
  );
};
