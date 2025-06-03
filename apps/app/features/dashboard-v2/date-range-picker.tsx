import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const DateRangePicker = () => {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState("last-7-days");

  const onSelect = (dateRange: string) => {
    setDateRange(dateRange);
    setOpen(false);
  };

  const dateRanges = [
    {
      label: "Today",
      value: "today",
    },
    {
      label: "Yesterday",
      value: "yesterday",
    },
    {
      label: "Last 7 days",
      value: "last-7-days",
    },
    {
      label: "Last 30 days",
      value: "last-30-days",
    },
    {
      label: "Last 90 days",
      value: "last-90-days",
    },
    {
      label: "Last 180 days",
      value: "last-180-days",
    },
    {
      label: "Last 365 days",
      value: "last-365-days",
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {dateRanges.find((range) => range.value === dateRange)?.label}
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search integration..." />
          <CommandEmpty>No integration found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {dateRanges.map((dateRange) => (
                <CommandItem
                  key={dateRange.value}
                  value={dateRange.value}
                  onSelect={onSelect}
                >
                  {dateRange.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
