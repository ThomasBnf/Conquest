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
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  value: string | undefined;
  onValueChange: (value: string) => void;
};

export const AttributesPicker = ({ value, onValueChange }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value ? (
            <span className="capitalize">
              {value
                .replace(/([A-Z])/g, " $1")
                .trim()
                .toLowerCase()}
            </span>
          ) : (
            <span className="text-muted-foreground">Select attribute</span>
          )}
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search attribute..." />
          <CommandEmpty>No attribute found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {[
                "company",
                ...Object.entries(MemberSchema.shape)
                  .filter(([key]) =>
                    [
                      "firstName",
                      "lastName",
                      "primaryEmail",
                      "emails",
                      "phones",
                      "jobTitle",
                      "avatarUrl",
                      "country",
                      "language",
                      "linkedinUrl",
                      "isStaff",
                      "createdAt",
                      "updatedAt",
                    ].includes(key),
                  )
                  .map(([key]) => key),
              ]
                .sort()
                .map((key) => (
                  <CommandItem
                    key={key}
                    value={key}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue);
                      setOpen(false);
                    }}
                    className="capitalize"
                  >
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                      .toLowerCase()}
                    {value === key && <Check size={16} className="ml-auto" />}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
