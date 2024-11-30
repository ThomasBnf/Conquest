import { useClickOutside } from "@/hooks/useClickOutside";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Filter } from "@conquest/zod/filters.schema";
import cuid from "cuid";
import { ListFilter } from "lucide-react";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { FiltersList } from "./filters-list";
import { useTab } from "./hooks/useTab";
import { QueryDialog } from "./query-dialog";
import { SelectPicker } from "./select-picker";

type Props = {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdateNode?: (filters: Filter[]) => void;
};

export const FilterButton = ({
  filters,
  setFilters,
  handleUpdateNode,
}: Props) => {
  const { tab, setTab } = useTab();
  const [filter, setFilter] = useState<Filter>();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    setOpen(false);
    setTimeout(() => {
      setTab(undefined);
    }, 100);
  });

  const handleFilterSelect = (filter: Filter) => {
    const filterWithId = { ...filter, id: cuid() };

    switch (filter.type) {
      case "text": {
        setFilter(filterWithId);
        setTab("query");
        return;
      }
      case "number": {
        setFilter(filterWithId);
        setTab("query");
        return;
      }
      case "select": {
        setFilter(filterWithId);
        setTab("select");
        return;
      }
      case "activity": {
        setOpen(false);
        setTimeout(() => {
          setFilter(filterWithId);
          setFilters((filters) => [...filters, filterWithId]);
        }, 100);
        return;
      }
    }
  };

  const handleApply = (query: string | number) => {
    if (!filter) return;

    setFilters((prev) => {
      const filterExists = prev.some((f) => f.id === filter.id);
      const value = filter.type === "text" ? query.toString() : Number(query);

      const updatedFilter =
        filter.type === "text"
          ? { ...filter, value: value.toString() }
          : { ...filter, value: Number(value) };

      const newFilters = filterExists
        ? prev.map((f) => (f.id === filter.id ? updatedFilter : f))
        : [...prev, updatedFilter];

      handleUpdateNode?.(newFilters);

      return newFilters;
    });

    setOpen(false);
    setTab(undefined);
  };

  return (
    <>
      <QueryDialog
        filter={filter}
        tab={tab}
        setTab={setTab}
        handleApply={handleApply}
      />
      <div
        className={cn(
          "flex flex-wrap items-center",
          filters.length > 0 && "gap-1",
        )}
      >
        <FiltersList
          filters={filters}
          setFilters={setFilters}
          handleUpdateNode={handleUpdateNode}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <ListFilter size={16} />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent ref={ref} className="w-[200px] p-0" align="start">
            {tab === "select" ? (
              <SelectPicker
                filter={filter}
                setFilters={setFilters}
                setOpenDropdown={setOpen}
                handleUpdateNode={handleUpdateNode}
              />
            ) : (
              <Command>
                <CommandInput placeholder="Search filter..." />
                <CommandEmpty>No filter found.</CommandEmpty>
                <CommandList>
                  <CommandGroup heading="Member">
                    {filtersMember.map((filter) => (
                      <CommandItem
                        key={filter.id}
                        onSelect={() => handleFilterSelect(filter)}
                      >
                        {filter.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Activity">
                    {filtersActivity.map((filter) => (
                      <CommandItem
                        key={filter.id}
                        onSelect={() => handleFilterSelect(filter)}
                      >
                        {filter.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

const filtersMember: Filter[] = [
  {
    id: "1",
    label: "Tags",
    type: "select",
    field: "tags",
    operator: "contains",
    values: [],
  },
  {
    id: "2",
    label: "Emails",
    type: "text",
    field: "emails",
    operator: "contains",
    value: "",
  },
  {
    id: "3",
    label: "Phones",
    type: "text",
    field: "phones",
    operator: "contains",
    value: "",
  },
  {
    id: "4",
    label: "Job title",
    type: "text",
    field: "job_title",
    operator: "contains",
    value: "",
  },
  {
    id: "5",
    label: "Localisation",
    type: "select",
    field: "localisation",
    operator: "contains",
    values: [],
  },
  {
    id: "6",
    label: "Source",
    type: "select",
    field: "source",
    operator: "contains",
    values: [],
  },
];

const filtersActivity: Filter[] = [
  {
    id: "3",
    label: "Activity type",
    type: "activity",
    activity_type: [],
    operator: ">",
    value: 1,
    channel: {
      id: "",
      label: "",
    },
    dynamic_date: "30 days",
    days: 30,
  },
];
