import { useClickOutside } from "@/hooks/useClickOutside";
import { useOpenFilters } from "@/hooks/useOpenFilters";
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
import type {
  Filter,
  FilterActivity,
  FilterLevel,
  FilterNumber,
  FilterSelect,
  FilterText,
} from "@conquest/zod/schemas/filters.schema";
import cuid from "cuid";
import { ListFilter } from "lucide-react";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { useTab } from "./hooks/useTab";
import { InputDialog } from "./input-dialog";
import { LevelPicker } from "./level-picker";
import { SelectPicker } from "./select-picker";

type Props = {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  handleUpdate: (filters: Filter[]) => void;
};

export const FilterButton = ({ filters, setFilters, handleUpdate }: Props) => {
  const { tab, setTab } = useTab();
  const { setOpen: setOpenFilters } = useOpenFilters();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>();
  const ref = useRef<HTMLDivElement>(null);
  const refButton = useRef<HTMLButtonElement>(null);

  useClickOutside(ref, () => {
    if (refButton.current) {
      return setTimeout(() => {
        setFilter(undefined);
        setTab(undefined);
      }, 100);
    }
    setOpen(false);
    setTimeout(() => {
      setFilter(undefined);
      setTab(undefined);
    }, 100);
  });

  const handleFilterSelect = (filter: Filter) => {
    const filterWithId = { ...filter, id: cuid() };
    setFilter(filterWithId);

    switch (filter.type) {
      case "text": {
        setTab("input");
        return;
      }
      case "number": {
        setTab("input");
        return;
      }
      case "select": {
        setTab("select");
        return;
      }
      case "level": {
        setTab("level");
        return;
      }
      case "activity": {
        setOpen(false);
        setTimeout(() => {
          setFilters((filters) => [...filters, filterWithId]);
          setOpenFilters(true);
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

      handleUpdate(newFilters);

      return newFilters;
    });

    setOpen(false);
    setTab(undefined);
  };

  return (
    <>
      <InputDialog
        filter={filter as FilterText | FilterNumber | FilterActivity}
        handleApply={handleApply}
        type={filter?.type as "number" | "text"}
      />
      <div
        className={cn(
          "flex flex-wrap items-center",
          filters.length > 0 && "gap-1",
        )}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button ref={refButton} variant="outline">
              <ListFilter size={16} />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent ref={ref} className="w-[200px] p-0" align="start">
            {tab === "select" ? (
              <SelectPicker
                filter={filter as FilterSelect}
                setFilters={setFilters}
                setOpenDropdown={setOpen}
                handleUpdate={handleUpdate}
              />
            ) : tab === "level" ? (
              <LevelPicker
                filter={filter as FilterLevel}
                setFilters={setFilters}
                handleUpdate={handleUpdate}
                setOpenDropdown={setOpen}
              />
            ) : (
              <Command>
                <CommandInput placeholder="Search filter..." />
                <CommandList>
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
    label: "Tag",
    type: "select",
    field: "tag",
    operator: "contains",
    values: [],
  },
  {
    id: "1",
    label: "Level",
    type: "level",
    field: "level",
    operator: "greater or equal",
    value: 1,
  },
  {
    id: "1",
    label: "Pulse",
    type: "number",
    field: "pulse",
    operator: "greater or equal",
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
    label: "Location",
    type: "select",
    field: "location",
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
    label: "Primary email",
    type: "text",
    field: "primary_email",
    operator: "contains",
    value: "",
  },
  {
    id: "1",
    label: "Phones",
    type: "text",
    field: "phones",
    operator: "contains",
    value: "",
  },
];

const filtersActivity: Filter[] = [
  {
    id: "1",
    label: "Activity type",
    type: "activity",
    activity_types: [],
    operator: "greater or equal",
    value: 1,
    channel: {
      id: "",
      label: "",
    },
    dynamic_date: "30 days",
    days: 30,
  },
];
