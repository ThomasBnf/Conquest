import { useFilters } from "@/context/filtersContext";
import { trpc } from "@/server/client";
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
import { DiscourseDetailsSchema } from "@conquest/zod/schemas/integration.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";

export const FilterButton = () => {
  const [open, setOpen] = useState(false);
  const { groupFilters, onAddFilter } = useFilters();

  const source = "Discourse";
  const { data: discourse } = trpc.integrations.bySource.useQuery({ source });

  const details = discourse
    ? DiscourseDetailsSchema.parse(discourse?.details)
    : null;

  const { user_fields } = details ?? {};

  const filtersDiscourse: Filter[] =
    user_fields?.map((field) => ({
      id: field.id,
      label: field.name,
      type: "text",
      field: `discourse-${field.id}`,
      operator: "contains",
      value: "",
    })) ?? [];

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
              <CommandList className="max-h-[400px]">
                <CommandGroup heading="Activity">
                  {filtersActivity.map((filter) => (
                    <CommandItem
                      key={filter.id}
                      value={filter.label}
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
                      value={filter.label}
                      onSelect={() => onSelectFilter(filter)}
                    >
                      {filter.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {discourse && (
                  <CommandGroup heading="Discourse">
                    {filtersDiscourse.map((filter) => (
                      <CommandItem
                        key={filter.id}
                        value={`_${filter.label}`}
                        onSelect={() => onSelectFilter(filter)}
                      >
                        {filter.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
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
    id: uuid(),
    label: "Country",
    type: "select",
    field: "country",
    operator: "contains",
    values: [],
  },
  {
    id: uuid(),
    label: "Email",
    type: "text",
    field: "primary_email",
    operator: "contains",
    value: "",
  },
  {
    id: uuid(),
    label: "Job title",
    type: "text",
    field: "job_title",
    operator: "contains",
    value: "",
  },
  {
    id: uuid(),
    label: "Language",
    type: "select",
    field: "language",
    operator: "contains",
    values: [],
  },
  {
    id: uuid(),
    label: "Level",
    type: "level",
    field: "level",
    operator: ">",
    value: 1,
  },
  {
    id: uuid(),
    label: "Profiles",
    type: "select",
    field: "profiles",
    operator: "contains",
    values: [],
  },
  {
    id: uuid(),
    label: "Phones",
    type: "text",
    field: "phones",
    operator: "contains",
    value: "",
  },
  {
    id: uuid(),
    label: "Pulse",
    type: "number",
    field: "pulse",
    operator: ">",
    value: 1,
  },
  {
    id: uuid(),
    label: "Source",
    type: "select",
    field: "source",
    operator: "contains",
    values: [],
  },
  {
    id: uuid(),
    label: "Tags",
    type: "select",
    field: "tags",
    operator: "contains",
    values: [],
  },
];

const filtersActivity: Filter[] = [
  {
    id: uuid(),
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
