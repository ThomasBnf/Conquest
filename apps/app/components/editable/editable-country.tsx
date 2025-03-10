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
import { countries } from "country-data-list";
import { useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { CountryBadge } from "../badges/country-badge";

export type Country = {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
};

type Props = {
  country: string | null;
  onUpdate: (value: string | null) => void;
};

export const EditableCountry = ({ country, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(country);

  const onUpdateLocale = (country: Country) => {
    setValue(country.alpha2);
    onUpdate(country.alpha2);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start truncate p-1">
          {value ? (
            <CountryBadge country={value} />
          ) : (
            <span className="text-muted-foreground">Set country</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[233px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.all
                .filter(
                  (country: Country) =>
                    country.emoji &&
                    country.status !== "deleted" &&
                    country.ioc !== "PRK",
                )
                .map((country) => (
                  <CommandItem
                    key={country.name}
                    value={country.name}
                    onSelect={() => onUpdateLocale(country)}
                    className="h-8"
                  >
                    <div className="flex w-0 flex-grow space-x-2 overflow-hidden">
                      <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
                        <CircleFlag
                          countryCode={country.alpha2.toLowerCase()}
                          height={20}
                        />
                      </div>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {country.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
