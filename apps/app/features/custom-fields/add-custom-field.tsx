"use client";

import { useWorkspace } from "@/hooks/useWorkspace";
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
import { Record } from "@conquest/zod/enum/record.enum";
import { CustomField } from "@conquest/zod/schemas/custom-field.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { customFields } from "./constants";
import { useCreateField } from "./mutations/useCreateField";

type Props = {
  record: Record;
};

export const AddCustomField = ({ record }: Props) => {
  const { workspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const createField = useCreateField();

  const onSelect = (field: CustomField) => {
    createField(field);
    setOpen(false);
  };

  if (!workspace) return;

  const fields = customFields(record, workspace.id);

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
              {fields.map((field) => (
                <CommandItem key={field.id} onSelect={() => onSelect(field)}>
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
