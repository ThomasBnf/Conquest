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
import { LocationBadge } from "./location-badge";
import { FlagComponent } from "./phone-input";

type Props = {
  location: string | null;
  onUpdate: (value: string | null) => void;
};

export const EditableLocation = ({ location, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(location);

  const countries = getCountries().map((country: Country) => ({
    label: en[country],
    value: country,
  }));

  const onUpdateLocation = (location: string | null) => {
    setValue(location);
    onUpdate(location);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start p-1"
          classNameSpan="text-muted-foreground justify-start "
        >
          {value ? <LocationBadge location={value} /> : "Select location"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[233px] p-0">
        <Command>
          <CommandInput placeholder="Search location..." />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup>
              {countries?.map((country) => (
                <CommandItem
                  key={country.label}
                  value={country.label}
                  onSelect={() => onUpdateLocation(country.value)}
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
