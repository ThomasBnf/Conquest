"use client";

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
import { Plus } from "lucide-react";
import * as React from "react";

export const AddCustomField = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <Plus size={16} />
          New custom field
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No field found.</CommandEmpty>
            <CommandGroup>
              {customFields.map((field) => (
                <CommandItem key={field.type}>{field.label}</CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const customFields = [
  {
    type: "boolean",
    label: "Boolean",
  },
  {
    type: "date",
    label: "Date",
  },
  {
    type: "multi-select",
    label: "Multi-select",
  },
  {
    type: "number",
    label: "Number",
  },
  {
    type: "select",
    label: "Select",
  },
  {
    type: "text",
    label: "Text",
  },
];
