import { Button } from "@conquest/ui/button";
import { useFilters } from "context/filtersContext";
import { Trash2 } from "lucide-react";
import type { Filter } from "schemas/filters.schema";
import type { GroupFilter } from "schemas/node.schema";
import { DatePicker } from "./pickers/date-picker";
import { FieldPicker } from "./pickers/field-picker";
import { GroupOperatorPicker } from "./pickers/group-operator";
import { OperatorPicker } from "./pickers/operator-picker";
import { QueryInput } from "./pickers/query-input";
import { SourcePicker } from "./pickers/source-picker";
import { TypePicker } from "./pickers/type-picker";

type Props = {
  groupFilter: GroupFilter;
  filter: Filter;
};

export const FilterBlock = ({ groupFilter, filter }: Props) => {
  const { field } = filter;
  const { onDeleteFilter } = useFilters();

  const hasFilters = groupFilter.filters.length > 1;
  const isFirstFilter = groupFilter.filters.indexOf(filter) === 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex w-full flex-col divide-y overflow-hidden rounded-md border">
        <div className="flex w-full items-center divide-x">
          {hasFilters && (
            <GroupOperatorPicker
              groupFilter={groupFilter}
              isFirstFilter={isFirstFilter}
            />
          )}
          <FieldPicker filter={filter} />
        </div>
        <div className="flex items-center divide-x">
          <OperatorPicker filter={filter} />
          {field === "type" && <TypePicker filter={filter} />}
          {field === "source" && <SourcePicker filter={filter} />}
          {field === "created_at" && <DatePicker filter={filter} />}
          {field === "activities_count" && <QueryInput filter={filter} />}
          <Button
            variant="outline"
            onClick={() => onDeleteFilter(filter)}
            className="rounded-none border-b-0 border-l border-t-0"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
