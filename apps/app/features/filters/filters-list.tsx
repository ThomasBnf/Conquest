import { useFilters } from "@/context/filtersContext";
import { useOpenFilters } from "@/hooks/useOpenFilters";
import { Button } from "@conquest/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { ListFilter } from "lucide-react";
import { FilterActivity } from "./filter-activity";
import { FilterButton } from "./filter-button";
import { FilterPicker } from "./filter-picker";

type Props = {
  align?: "start" | "end";
  className?: string;
};

export const FiltersList = ({ align = "start", className }: Props) => {
  const { groupFilters, resetFilters } = useFilters();
  const { open, setOpen } = useOpenFilters();
  const { filters } = groupFilters;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <ListFilter size={16} />
          Filters
          {filters.length > 0 && (
            <span className="actions-secondary ml-1 flex size-5 items-center justify-center rounded-md border bg-muted text-xs">
              {filters.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="space-y-3 p-4">
        <p className="font-medium">Filters</p>
        {filters.length > 0 && (
          <div className="flex flex-col gap-2">
            {filters.map((filter, index) =>
              filter.type === "activity" ? (
                <FilterActivity key={filter.id} index={index} filter={filter} />
              ) : (
                <FilterPicker key={filter.id} index={index} filter={filter} />
              ),
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <FilterButton />
          <Button
            variant="link"
            onClick={() => {
              resetFilters();
              setOpen(false);
            }}
          >
            Reset filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
