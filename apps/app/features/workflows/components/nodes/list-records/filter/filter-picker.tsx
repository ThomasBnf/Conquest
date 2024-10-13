import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { useFilters } from "context/filtersContext";
import { Plus } from "lucide-react";
import type { Filter } from "schemas/filters.schema";
import type { GroupFilter } from "schemas/node.schema";

type Props = {
  groupFilter: GroupFilter;
};

export const FilterPicker = ({ groupFilter }: Props) => {
  const { onAddFilter } = useFilters();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-fit border-dashed">
          <Plus size={16} />
          Add Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {filters.map((filter) => (
          <DropdownMenuItem
            key={filter.id}
            onClick={() => onAddFilter({ groupFilter, filter })}
          >
            {filter.label}
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
    label: "Creation date",
    field: "created_at",
    operator: "is",
    days: 1,
  },
];
