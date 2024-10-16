import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import {
  type Filter,
  FilterDateSchema,
  FilterSelectSchema,
} from "@conquest/zod/filters.schema";
import { useFilters } from "context/filtersContext";
import { ChevronDown } from "lucide-react";

type Props = {
  filter: Filter;
};

export const FieldPicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();

  const onUpdateField = (selectedFilter: Filter) => {
    if (selectedFilter.field === "activities_count") return;

    if (selectedFilter.field === "created_at") {
      const parsedFilter = FilterDateSchema.parse({
        ...selectedFilter,
        id: filter.id,
      });

      const { operator, field, days } = parsedFilter;

      onUpdateFilter({
        ...parsedFilter,
        operator,
        field,
        days,
      });
    } else {
      const parsedFilter = FilterSelectSchema.parse({
        ...selectedFilter,
        id: filter.id,
      });

      const { operator, field } = parsedFilter;

      onUpdateFilter({
        ...parsedFilter,
        operator,
        field,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="dropdown"
          className="w-full rounded-none"
          classNameSpan="justify-between"
        >
          <span className="first-letter:uppercase">
            {filter.field.replace(/_/g, " ")}
          </span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {filters.map((selectedFilter) => (
          <DropdownMenuItem
            key={selectedFilter.id}
            onClick={() => onUpdateField(selectedFilter)}
          >
            {selectedFilter.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const filters: Filter[] = [
  {
    id: "1",
    label: "Type",
    field: "type",
    operator: "contains",
    values: [],
  },
  {
    id: "2",
    label: "Source",
    field: "source",
    operator: "contains",
    values: [],
  },
  {
    id: "3",
    label: "Created at",
    field: "created_at",
    operator: "is",
    days: 1,
  },
];
