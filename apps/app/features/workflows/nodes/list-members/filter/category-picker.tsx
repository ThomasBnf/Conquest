import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Filter } from "@conquest/zod/filters.schema";
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
        label: "Love",
        field: "love",
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
