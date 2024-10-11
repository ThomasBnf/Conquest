import { useFilters } from "@/context/filtersContext";
import type { Filter, FilterCount } from "@/schemas/filters.schema";
import type { Category } from "@/schemas/node.schema";
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
        {categories.map((category) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger className="capitalize">
              {category.replace(/_/g, " ")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {filters.map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => onAddGroupFilter({ category, filter })}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const categories: Category[] = [
  "activities",
  "last_activity",
  "first_activity",
];

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

const countFilter: FilterCount = {
  id: "4",
  label: "Activities count",
  field: "activities_count",
  operator: "greater_than",
  value: 1,
};
