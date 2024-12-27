import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { type Country, getCountries } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import { FlagComponent } from "./phone-input";

type Props = {
  location: string | null;
  className?: string;
};

export const LocationBadge = ({ location, className }: Props) => {
  const countries = getCountries().map((country: Country) => ({
    label: en[country],
    value: country,
  }));

  const country = countries.find((c) => c.value === location);
  if (!country) return null;

  return (
    <Badge variant="outline" className={cn("gap-2", className)}>
      <FlagComponent country={country.value} countryName={country.label} />
      <p className="font-medium">{country.label}</p>
    </Badge>
  );
};
