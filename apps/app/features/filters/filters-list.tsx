import { AlertDialog } from "@/components/custom/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Button } from "@conquest/ui/src/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@conquest/ui/src/components/popover";
import type { Filter } from "@conquest/zod/filters.schema";
import { MoreVertical, Trash2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { FilterActivity } from "./filter-activity";
import { FilterButton } from "./filter-button";
import { FilterPicker } from "./filter-picker";

type Props = {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdateNode?: (filters: Filter[]) => void;
  align?: "start" | "end";
};

export const FiltersList = ({
  filters,
  setFilters,
  handleUpdateNode,
  align,
}: Props) => {
  const [open, setOpen] = useState(false);

  const onClearFilters = async () => {
    setFilters([]);
    handleUpdateNode?.([]);
    return 0;
  };

  return (
    <Popover>
      <div className="flex w-fit items-center divide-x overflow-hidden rounded-md border">
        <PopoverTrigger asChild>
          <Button variant="dropdown">
            Advanced filters{" "}
            <span className="actions-secondary flex size-5 items-center justify-center rounded-md border bg-muted text-xs">
              {filters.length}
            </span>
          </Button>
        </PopoverTrigger>
        <AlertDialog
          title="Delete filters"
          description="Are you sure you want to delete all filters?"
          onConfirm={onClearFilters}
          open={open}
          setOpen={setOpen}
        />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="dropdown">
              <MoreVertical size={15} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setOpen(true)}
            >
              <Trash2 size={15} />
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
                      handleUpdateNode={handleUpdateNode}
                    />
                  );
                }
                default: {
                  return (
                    <FilterPicker
                      key={filter.id}
                      filter={filter}
                      setFilters={setFilters}
                      handleUpdateNode={handleUpdateNode}
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
            handleUpdateNode={handleUpdateNode}
          />
          <Button variant="ghost" onClick={onClearFilters}>
            Clear all filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
