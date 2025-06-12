import { useUpdateField } from "@/features/custom-fields/mutations/useUpdateField";
import { OptionMenu } from "@/features/custom-fields/option-menu";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";

type Props = {
  field: CustomField;
  values: string[];
  onUpdate: (values: string[]) => void;
};

export const EditableMultiSelect = ({ field, values, onUpdate }: Props) => {
  const { options } = field;
  const currentOptions = options?.filter((option) =>
    values.includes(option.id),
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const existingOption = options?.find((option) => option.label === query);
  const updateField = useUpdateField();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(true);
  };

  const onSelect = (optionId: string) => {
    const hasOption = values.includes(optionId);

    onUpdate(
      hasOption
        ? values.filter((id) => id !== optionId)
        : [...values, optionId],
    );

    setQuery("");
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
        onClick={onClick}
        className={cn(currentOptions?.length ? "-ml-[6px]" : "-ml-[9px]")}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start truncate",
            currentOptions?.length && "px-1",
          )}
        >
          {currentOptions?.length ? (
            <div className="flex flex-wrap gap-1">
              {currentOptions.map((option) => (
                <p
                  key={option.id}
                  className={cn(
                    `truncate rounded-md bg-${option.color}-100 px-1.5 py-0.5 text-${option.color}-900`,
                  )}
                >
                  {option.label}
                </p>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Select options</span>
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
            <CommandGroup heading="Select or create options">
              {options?.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  className="h-8"
                >
                  <div
                    className="flex w-full items-center gap-2"
                    onClick={() => onSelect(option.id)}
                  >
                    <Checkbox checked={values.includes(option.id)} />
                    <p
                      className={cn(
                        `truncate rounded-md bg-${option.color}-100 px-1.5 py-0.5 text-${option.color}-900`,
                      )}
                    >
                      {option.label}
                    </p>
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
