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
import type { Country as CountryType } from "@conquest/zod/types/country";
import { getAllCountries } from "country-locale-map";
import { useState } from "react";
import type { Country } from "react-phone-number-input";
import { CountryBadge } from "./country-badge";
import { FlagComponent } from "./phone-input";

type Props = {
  locale: string | null;
  onUpdate: (value: string | null) => void;
};

export const EditableLocale = ({ locale, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(locale);

  const countries = getAllCountries();

  const onUpdateLocale = (country: CountryType) => {
    setValue(country.default_locale);
    onUpdate(country.default_locale);
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
          {value ? <CountryBadge locale={value} /> : "Select locale"}
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
                  key={country.name}
                  value={country.name}
                  onSelect={() => onUpdateLocale(country as CountryType)}
                >
                  <FlagComponent
                    country={country.alpha2 as Country}
                    countryName={country.name}
                  />
                  <p className="ml-2">{country.name}</p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
