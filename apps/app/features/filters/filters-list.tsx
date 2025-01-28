import { useOpenFilters } from "@/hooks/useOpenFilters";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { MoreVertical, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { FilterActivity } from "./filter-activity";
import { FilterButton } from "./filter-button";
import { FilterPicker } from "./filter-picker";

type Props = {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdate?: (filters: Filter[]) => void;
  align?: "start" | "end";
};

export const FiltersList = ({
  filters,
  setFilters,
  handleUpdate,
  align,
}: Props) => {
  const { open, setOpen } = useOpenFilters();

  const onClearFilters = async () => {
    setFilters([]);
    handleUpdate?.([]);
    return 0;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex h-8 w-fit items-center divide-x overflow-hidden rounded-md border">
        <PopoverTrigger asChild>
          <Button variant="dropdown">
            Filters{" "}
            <span className="actions-secondary flex size-5 items-center justify-center rounded-md border bg-muted text-xs">
              {filters.length}
            </span>
          </Button>
        </PopoverTrigger>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="dropdown">
              <MoreVertical size={16} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onClearFilters}
            >
              <Trash2 size={16} />
              Delete {filters.length > 1 ? "filters" : "filter"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <PopoverContent align={align} className="min-w-96">
        {filters.length > 0 && (
          <div className="mb-4 flex flex-col gap-1">
            {filters.map((filter) => {
              switch (filter.type) {
                case "activity": {
                  return (
                    <FilterActivity
                      key={filter.id}
                      filter={filter}
                      setFilters={setFilters}
                      handleUpdate={handleUpdate}
                    />
                  );
                }
                default: {
                  return (
                    <FilterPicker
                      key={filter.id}
                      filter={filter}
                      setFilters={setFilters}
                      handleUpdate={handleUpdate}
                    />
                  );
                }
              }
            })}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <FilterButton
            filters={filters}
            setFilters={setFilters}
            handleUpdate={handleUpdate}
          />
          <Button variant="ghost" onClick={onClearFilters}>
            Clear all filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
