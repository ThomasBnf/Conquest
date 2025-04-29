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

  const { data: discourse } = trpc.integrations.bySource.useQuery({
    source: "Discourse",
  });

  const { data: github } = trpc.integrations.bySource.useQuery({
    source: "Github",
  });

  const details = discourse
    ? DiscourseDetailsSchema.parse(discourse?.details)
    : null;

  const { userFields } = details ?? {};

  const filtersDiscourse: Filter[] =
    userFields?.map((field) => ({
      id: field.id,
      label: field.name,
      type: "text",
      field: `discourse-${field.id}`,
      operator: "contains",
      value: "",
    })) ?? [];

  const filtersGithub: Filter[] = [
    {
      id: uuid(),
      label: "Bio",
      type: "text",
      field: "githubBio",
      operator: "contains",
      value: "",
    },
    {
      id: uuid(),
      label: "Blog",
      type: "text",
      field: "githubBlog",
      operator: "contains",
      value: "",
    },
    {
      id: uuid(),
      label: "Followers",
      type: "number",
      field: "githubFollowers",
      operator: ">",
      value: 1,
    },
    {
      id: uuid(),
      label: "Location",
      type: "text",
      field: "githubLocation",
      operator: "contains",
      value: "",
    },
  ];

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
              <CommandList>
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
                {userFields && userFields?.length > 0 && (
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
                {github && (
                  <CommandGroup heading="Github">
                    {filtersGithub.map((filter) => (
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
    field: "primaryEmail",
    operator: "contains",
    value: "",
  },
  {
    id: uuid(),
    label: "Job title",
    type: "text",
    field: "jobTitle",
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
    label: "Pulse Score",
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
    field: "activityType",
    activityTypes: [],
    operator: ">=",
    value: 1,
    channels: [],
    dynamicDate: "30 days",
    days: 30,
    displayCount: false,
    displayDate: false,
    displayChannel: false,
  },
];
