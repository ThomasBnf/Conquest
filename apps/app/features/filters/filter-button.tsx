import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";

export const FilterButton = () => {
  const [open, setOpen] = useState(false);
  const { groupFilters, onAddFilter } = useFilters();

  const onSelectFilter = (filter: Filter) => {
    const newFilter = {
      ...filter,
      id: uuid(),
    };
    setOpen(false);
    onAddFilter(newFilter);
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-center",
          groupFilters.filters.length > 0 && "gap-1",
        )}
      >
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Plus size={16} />
              Add filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Search filter..." />
              <CommandList className="max-h-[450px]">
                <CommandGroup heading="Activity">
                  {filtersActivity.map((filter) => (
                    <CommandItem
                      key={filter.id}
                      onSelect={() => onSelectFilter(filter)}
                    >
                      {filter.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Member">
                  {filtersMember.map((filter) => (
                    <CommandItem
                      key={filter.id}
                      onSelect={() => onSelectFilter(filter)}
                    >
                      {filter.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

const filtersMember: Filter[] = [
  {
    id: "1",
    label: "Country",
    type: "select",
    field: "country",
    operator: "contains",
    values: [],
  },
  {
    id: "1",
    label: "Job title",
    type: "text",
    field: "job_title",
    operator: "contains",
    value: "",
  },
  {
    id: "1",
    label: "Language",
    type: "select",
    field: "language",
    operator: "contains",
    values: [],
  },
  {
    id: "1",
    label: "Level",
    type: "level",
    field: "level",
    operator: ">",
    value: 1,
  },
  {
    id: "1",
    label: "Linked profiles",
    type: "select",
    field: "linked_profiles",
    operator: "contains",
    values: [],
  },
  {
    id: "1",
    label: "Phones",
    type: "text",
    field: "phones",
    operator: "contains",
    value: "",
  },
  {
    id: "1",
    label: "Primary email",
    type: "text",
    field: "primary_email",
    operator: "contains",
    value: "",
  },
  {
    id: "1",
    label: "Pulse",
    type: "number",
    field: "pulse",
    operator: ">",
    value: 1,
  },
  {
    id: "1",
    label: "Source",
    type: "select",
    field: "source",
    operator: "contains",
    values: [],
  },
  {
    id: "1",
    label: "Tags",
    type: "select",
    field: "tags",
    operator: "contains",
    values: [],
  },
];

const filtersActivity: Filter[] = [
  {
    id: "1",
    who: "who_did",
    label: "Activity type",
    type: "activity",
    field: "activity_type",
    activity_types: [],
    operator: ">=",
    value: 1,
    channels: [],
    dynamic_date: "30 days",
    days: 30,
    display_count: false,
    display_date: false,
    display_channel: false,
  },
];
