import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import {
  type DynamicDate,
  type Filter,
  FilterActivitySchema,
  NumberOperatorSchema,
  type Operator,
  type WhoOptions,
  WhoOptionsSchema,
  type FilterActivity as _FilterActivity,
} from "@conquest/zod/schemas/filters.schema";
import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { ActivityTypePicker } from "./activity-type-picker";
import { FilterMenu } from "./filter-menu";
import { InputDialog } from "./input-dialog";
import { OperatorPicker } from "./operator-picker";
import { RelativePicker } from "./relative-picker";
import { WhoPicker } from "./who-picker";

type Props = {
  filter: _FilterActivity;
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdate?: (filters: Filter[]) => void;
};

export const FilterActivity = ({ filter, setFilters, handleUpdate }: Props) => {
  if (!filter) return null;

  const filterActivity = FilterActivitySchema.parse(filter);

  const onDeleteFilter = () => {
    setFilters((prevFilters) => {
      const newFilters = prevFilters.filter((f) => f.id !== filter.id);

      handleUpdate?.(newFilters);
      return newFilters;
    });
  };

  const onUpdateWho = (option: WhoOptions) => {
    if (filter.type === "activity") {
      const who = WhoOptionsSchema.parse(option);
      setFilters((prevFilters) => {
        const newFilters = prevFilters.map((f) =>
          f.id === filter.id ? { ...filter, who } : f,
        );

        handleUpdate?.(newFilters);
        return newFilters;
      });
    }
  };

  const onUpdateActivityTypes = ({
    key,
    name,
  }: {
    key: string;
    name: string;
  }) => {
    const isActivityTypeSelected = filterActivity.activity_types.some(
      (type) => type.key === key,
    );

    setFilters((prevFilters) => {
      const newFilters = prevFilters.map((f) =>
        f.id === filter.id
          ? {
              ...f,
              activity_types: isActivityTypeSelected
                ? filterActivity.activity_types.filter(
                    (type) => type.key !== key,
                  )
                : [...filterActivity.activity_types, { key, name }],
            }
          : f,
      );

      handleUpdate?.(newFilters);
      return newFilters;
    });
  };

  const onUpdateOperator = (operator: Operator) => {
    if (filter.type === "activity") {
      const numberOperator = NumberOperatorSchema.parse(operator);

      setFilters((prevFilters) => {
        const newFilters = prevFilters.map((f) =>
          f.id === filter.id ? { ...filter, operator: numberOperator } : f,
        );

        handleUpdate?.(newFilters);
        return newFilters;
      });
    }
  };

  const onApply = (query: string | number) => {
    if (!filter) return;

    setFilters((prev) => {
      const filterExists = prev.some((f) => f.id === filter.id);
      const updatedFilter = { ...filter, value: Number(query) };

      const newFilters = filterExists
        ? prev.map((f) => (f.id === filter.id ? updatedFilter : f))
        : [...prev, updatedFilter];

      handleUpdate?.(newFilters);
      return newFilters;
    });
  };

  const onUpdateDate = (dynamic_date: DynamicDate) => {
    setFilters((prev) => {
      const newFilters = prev.map((f) =>
        f.id === filter.id ? { ...filter, dynamic_date } : f,
      );

      handleUpdate?.(newFilters);
      return newFilters;
    });
  };

  const onUpdateDisplayCount = (display_count: boolean) => {
    setFilters((prev) => {
      const newFilters = prev.map((f) =>
        f.id === filter.id ? { ...filter, display_count } : f,
      );

      handleUpdate?.(newFilters);
      return newFilters;
    });
  };

  return (
    <div className="flex h-8 w-fit items-center overflow-hidden rounded-md border">
      <WhoPicker filter={filter} handleUpdate={onUpdateWho} />
      <Separator orientation="vertical" />
      <ActivityTypePicker
        filter={filter}
        handleUpdateActivityTypes={onUpdateActivityTypes}
      />
      {filter.display_count && (
        <>
          <Separator orientation="vertical" />
          <OperatorPicker
            filter={filterActivity}
            handleUpdate={onUpdateOperator}
          />
          <Separator orientation="vertical" />
          <InputDialog
            type="number"
            filter={filter}
            handleApply={onApply}
            triggerButton
          />
        </>
      )}
      <Separator orientation="vertical" />
      <RelativePicker filter={filterActivity} handleUpdateDate={onUpdateDate} />
      <Separator orientation="vertical" />
      <FilterMenu filter={filter} handleUpdate={onUpdateDisplayCount} />
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        onClick={onDeleteFilter}
        className="h-full rounded-none"
      >
        <X size={15} />
      </Button>
    </div>
  );
};
