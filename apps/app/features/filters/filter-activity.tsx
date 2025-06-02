import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import type { FilterActivity as FilterActivityType } from "@conquest/zod/schemas/filters.schema";
import { Trash2 } from "lucide-react";
import { ActivityTypePicker } from "./activity-type-picker";
import { AndOrPicker } from "./and-or-picker";
import { ChannelsPicker } from "./channels-picker";
import { DatePicker } from "./date-picker";
import { FilterMenu } from "./filter-menu";
import { NumberInput } from "./number-input";
import { OperatorPicker } from "./operator-picker";
import { WhoPicker } from "./who-picker";

type Props = {
  index: number;
  filter: FilterActivityType;
};
export const FilterActivity = ({ index, filter }: Props) => {
  const { onDeleteFilter } = useFilters();

  return (
    <div className="flex items-center gap-1">
      {index === 0 ? (
        <p className="w-[75px] pl-1.5 text-muted-foreground">Where</p>
      ) : (
        <AndOrPicker />
      )}
      <WhoPicker filter={filter} />
      <ActivityTypePicker filter={filter} />
      {filter.displayCount && (
        <>
          <OperatorPicker filter={filter} />
          <NumberInput filter={filter} />
        </>
      )}
      {filter.displayChannel && <ChannelsPicker filter={filter} />}
      {filter.displayDate && <DatePicker filter={filter} />}
      <FilterMenu filter={filter} />
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
