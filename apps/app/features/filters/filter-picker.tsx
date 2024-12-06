import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import {
  BaseOperatorSchema,
  type Filter,
  type Operator,
} from "@conquest/zod/filters.schema";
import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { InputDialog } from "./input-dialog";
import { OperatorPicker } from "./operator-picker";
import { SelectPicker } from "./select-picker";

type Props = {
  filter: Filter;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdateNode?: (filters: Filter[]) => void;
};

export const FilterPicker = ({
  filter,
  setFilters,
  handleUpdateNode,
}: Props) => {
  if (!filter) return null;

  const handleDeleteFilter = () => {
    setFilters((prevFilters) => {
      const newFilters = prevFilters.filter((f) => f.id !== filter.id);

      handleUpdateNode?.(newFilters);
      return newFilters;
    });
  };

  const handleUpdateOperator = (operator: Operator) => {
    if (filter.type === "text") {
      const baseOperator = BaseOperatorSchema.parse(operator);

      setFilters((prevFilters) => {
        const newFilters = prevFilters.map((f) =>
          f.id === filter.id ? { ...filter, operator: baseOperator } : f,
        );

        handleUpdateNode?.(newFilters);
        return newFilters;
      });
    }
  };

  const handleApply = (query: string | number) => {
    if (filter.type === "text") {
      setFilters((prevFilters) => {
        const newFilters = prevFilters.map((f) =>
          f.id === filter.id ? { ...filter, value: query.toString() } : f,
        );

        handleUpdateNode?.(newFilters);
        return newFilters;
      });
    }

    if (filter.type === "number") {
      setFilters((prevFilters) => {
        const newFilters = prevFilters.map((f) =>
          f.id === filter.id ? { ...filter, value: Number(query) } : f,
        );

        handleUpdateNode?.(newFilters);
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
      {filter.type === "select" ? (
        <SelectPicker filter={filter} setFilters={setFilters} triggerButton />
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
      ) : filter.type === "date" ? (
        <p className="px-1">{filter.days}</p>
      ) : null}
      <Separator orientation="vertical" />
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
