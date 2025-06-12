import { useUpdateField } from "@/features/custom-fields/mutations/useUpdateField";
import { OptionMenu } from "@/features/custom-fields/option-menu";
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
import { getRandomColor } from "@conquest/utils/getRandomColor";
import { CustomField } from "@conquest/zod/schemas/custom-field.schema";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";

type Props = {
  field: CustomField;
  value: string | null;
  onUpdate: (value: string | null) => void;
};

export const EditableSelect = ({ field, value, onUpdate }: Props) => {
  const { options } = field;
  const currentOption = options?.find((option) => option.id === value);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const existingOption = options?.find((option) => option.label === query);
  const updateField = useUpdateField();

  const onSelect = (optionId: string) => {
    onUpdate(optionId);
    setQuery("");
    setOpen(false);
  };

  const onAddOption = () => {
    if (!options) return;

    const newOption = {
      id: uuid(),
      label: query,
      color: getRandomColor(),
    };

    updateField({
      ...field,
      options: [...options, newOption],
    });

    onSelect(newOption.id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        className={cn(currentOption ? "-ml-[6px]" : "-ml-[9px]")}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start truncate",
            currentOption && "px-1",
          )}
        >
          {currentOption ? (
            <p
              className={cn(
                `truncate rounded-md bg-${currentOption.color}-100 px-1.5 py-0.5 text-${currentOption.color}-900`,
              )}
            >
              {currentOption.label}
            </p>
          ) : (
            <span className="text-muted-foreground">Select option</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandGroup heading="Select or create option">
              {options?.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  className="group h-8"
                >
                  <div
                    className="flex w-full items-center"
                    onClick={() => onSelect(option.id)}
                  >
                    <p
                      className={cn(
                        `truncate rounded-md bg-${option.color}-100 px-1.5 py-0.5 text-${option.color}-900`,
                      )}
                    >
                      {option.label}
                    </p>
                    {currentOption?.id === option.id && (
                      <Check size={16} className="ml-2" />
                    )}
                  </div>
                  <OptionMenu field={field} option={option} />
                </CommandItem>
              ))}
            </CommandGroup>
            {query && !existingOption && (
              <CommandGroup>
                <CommandItem value={query} onSelect={onAddOption}>
                  <Plus size={16} className="mr-2" />
                  <span>Create "{query}"</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
