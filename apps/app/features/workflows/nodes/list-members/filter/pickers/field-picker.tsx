import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Filter } from "@conquest/zod/filters.schema";
import type { Category } from "@conquest/zod/node.schema";
import { ChevronDown } from "lucide-react";

type Props = {
  category: Category;
  filter: Filter;
};

export const FieldPicker = ({ category, filter }: Props) => {
  const { onUpdateFilter } = useFilters();

  const onUpdateField = (selectedFilter: Filter) => {
    onUpdateFilter({
      ...selectedFilter,
      id: filter.id,
    });
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
        {filters
          .filter((f) => f.category === category)
          .flatMap((filterGroup) => filterGroup.filters)
          .map((selectedFilter) => (
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
