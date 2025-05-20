"use client";

import { trpc } from "@/server/client";
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
import { CustomField } from "@conquest/zod/schemas/custom-fields.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useUpdateWorkspace } from "../workspaces/mutations/useUpdateWorkspace";

export const AddCustomField = () => {
  const { data: workspace } = trpc.workspaces.get.useQuery();

  const [open, setOpen] = useState(false);
  const updateWorkspace = useUpdateWorkspace();

  const onClick = (field: CustomField) => {
    if (!workspace) return;

    updateWorkspace({
      ...workspace,
      customFields: [...workspace.customFields, field],
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
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
                <CommandItem key={field.id} onSelect={() => onClick(field)}>
                  {field.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const customFields: CustomField[] = [
  {
    id: uuid(),
    label: "Date",
    type: "date",
    value: new Date().toISOString(),
  },
  {
    id: uuid(),
    label: "Multi-select",
    type: "multi-select",
    values: [],
  },
  {
    id: uuid(),
    label: "Number",
    type: "number",
    value: 0,
  },
  {
    id: uuid(),
    label: "Select",
    type: "select",
    value: "",
  },
  {
    id: uuid(),
    label: "Text",
    type: "text",
    value: "",
  },
];
