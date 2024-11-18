import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Filter } from "@conquest/zod/filters.schema";
import type { Category, GroupFilter } from "@conquest/zod/node.schema";
import { Plus } from "lucide-react";

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
        {filters
          .filter((f) => f.category === groupFilter.category)
          .flatMap((filterGroup) => filterGroup.filters)
          .map((filter) => (
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

const filters: {
  label: string;
  category: Category;
  filters: Filter[];
}[] = [
  {
    label: "Member",
    category: "member",
    filters: [
      {
        id: "1",
        label: "Tags",
        field: "tags",
        operator: "contains",
        values: [],
      },
      {
        id: "2",
        label: "Localisation",
        field: "localisation",
        operator: "contains",
        values: [],
      },
      {
        id: "3",
        label: "Points",
        field: "points",
        operator: "greater_than",
        value: 1,
      },
    ],
  },
  {
    label: "Activities",
    category: "activities",
    filters: [
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
    ],
  },
  {
    label: "First activity",
    category: "first_activity",
    filters: [
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
    ],
  },
  {
    label: "Last activity",
    category: "last_activity",
    filters: [
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
    ],
  },
];
