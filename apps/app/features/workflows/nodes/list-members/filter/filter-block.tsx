import { useFilters } from "@/context/filtersContext";
import { DatePicker } from "@/features/workflows/pickers/date-picker";
import { FieldPicker } from "@/features/workflows/pickers/field-picker";
import { GroupOperatorPicker } from "@/features/workflows/pickers/group-operator";
import { LocalisationPicker } from "@/features/workflows/pickers/localisation-picker";
import { OperatorPicker } from "@/features/workflows/pickers/operator-picker";
import { QueryInput } from "@/features/workflows/pickers/query-input";
import { SourcePicker } from "@/features/workflows/pickers/source-picker";
import { TagPicker } from "@/features/workflows/pickers/tag-picker";
import { TypePicker } from "@/features/workflows/pickers/type-picker";
import { Button } from "@conquest/ui/button";
import type { Filter } from "@conquest/zod/filters.schema";
import type { GroupFilter } from "@conquest/zod/node.schema";
import { Trash2 } from "lucide-react";

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
          <FieldPicker category={groupFilter.category} filter={filter} />
        </div>
        <div className="flex items-center divide-x">
          <OperatorPicker filter={filter} />
          {field === "localisation" && <LocalisationPicker filter={filter} />}
          {field === "love" && <QueryInput filter={filter} />}
          {field === "type" && <TypePicker filter={filter} />}
          {field === "source" && <SourcePicker filter={filter} />}
          {field === "created_at" && <DatePicker filter={filter} />}
          {field === "tags" && <TagPicker filter={filter} />}
          <Button
            variant="outline"
            onClick={() => onDeleteFilter(filter)}
            className="rounded-none border-t-0 border-b-0 border-l"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
