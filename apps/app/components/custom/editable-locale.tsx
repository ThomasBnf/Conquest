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
import { useState } from "react";
import { type Country, getCountries } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import { LocaleBadge } from "./locale-badge";
import { FlagComponent } from "./phone-input";

type Props = {
  locale: string | null;
  onUpdate: (value: string | null) => void;
};

export const EditableLocale = ({ locale, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(locale);

  const countries = getCountries().map((country: Country) => ({
    label: en[country],
    value: country,
  }));

  const onUpdateLocale = (locale: string | null) => {
    setValue(locale);
    onUpdate(locale);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start p-1"
          classNameSpan="text-muted-foreground justify-start "
        >
          {value ? <LocaleBadge locale={value} /> : "Select locale"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[233px] p-0">
        <Command>
          <CommandInput placeholder="Search locale..." />
          <CommandList>
            <CommandEmpty>No locale found.</CommandEmpty>
            <CommandGroup>
              {countries?.map((country) => (
                <CommandItem
                  key={country.label}
                  value={country.label}
                  onSelect={() => onUpdateLocale(country.value)}
                >
                  <FlagComponent
                    country={country.value}
                    countryName={country.label}
                  />
                  <p className="ml-2">{country.label}</p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
