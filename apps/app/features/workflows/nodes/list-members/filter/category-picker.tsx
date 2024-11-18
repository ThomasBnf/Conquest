import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type {
  Filter,
  FilterCount,
  FilterTag,
} from "@conquest/zod/filters.schema";
import type { Category } from "@conquest/zod/node.schema";
import { Plus } from "lucide-react";

export const CategoryPicker = () => {
  const { onAddGroupFilter } = useFilters();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-fit border-dashed">
          <Plus size={16} />
          Add Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {filters.map((category) => (
          <DropdownMenuSub key={category.label}>
            <DropdownMenuSubTrigger className="capitalize">
              {category.label}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {category.filters.map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() =>
                    onAddGroupFilter({
                      category: category.category,
                      filter,
                    })
                  }
                >
                  {filter.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            onAddGroupFilter({
              category: "activities_count",
              filter: countFilter,
            })
          }
        >
          Activities count
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            onAddGroupFilter({
              category: "tags",
              filter: tagFilter,
            })
          }
        >
          Tags
        </DropdownMenuItem>
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
        label: "Localisation",
        field: "localisation",
        operator: "contains",
        values: [],
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

const countFilter: FilterCount = {
  id: "4",
  label: "Activities count",
  field: "activities_count",
  operator: "greater_than",
  value: 1,
};

const tagFilter: FilterTag = {
  id: "4",
  label: "Tags",
  field: "tags",
  operator: "contains",
  values: [],
};
