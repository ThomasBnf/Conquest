import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/utils/cn";
import { useFilters } from "context/filtersContext";
import { CategoryPicker } from "./category-picker";
import { FilterBlock } from "./filter-block";
import { FilterPicker } from "./filter-picker";

export const GroupFilters = () => {
  const { groupFilters, onDeleteGroup } = useFilters();

  return (
    <div className={cn("flex flex-col", groupFilters.length > 0 && "gap-1.5")}>
      <div className="flex flex-col gap-1">
        {groupFilters.map((group) => (
          <div
            key={group.id}
            className="flex flex-col items-start gap-2 rounded-lg border bg-muted p-3"
          >
            <p className="font-medium first-letter:uppercase">
              {group.category.replace(/_/g, " ")}
            </p>
            <div className="flex w-full flex-col gap-1">
              {group.filters.map((filter) => (
                <FilterBlock
                  key={filter.id}
                  groupFilter={group}
                  filter={filter}
                />
              ))}
            </div>
            {group.category !== "activities_count" && (
              <div className="flex w-full items-center justify-between">
                <FilterPicker groupFilter={group} />
                <Button
                  variant="link"
                  className="text-muted-foreground"
                  onClick={() => onDeleteGroup(group)}
                >
                  Delete group
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <CategoryPicker />
    </div>
  );
};
