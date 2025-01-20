import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { type Country, getCountries } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import { FlagComponent } from "./phone-input";

type Props = {
  locale: string | null;
  className?: string;
};

export const LocaleBadge = ({ locale, className }: Props) => {
  const countryCode = locale?.split("-")[1];
  const countries = getCountries().map((country: Country) => ({
    label: en[country],
    value: country,
  }));

  const country = countries.find((c) => c.value === countryCode);
  if (!country) return null;

  return (
    <Badge
      variant="secondary"
      className={cn("gap-2 overflow-hidden", className)}
    >
      <FlagComponent country={country.value} countryName={country.label} />
      <p className="truncate font-medium">{country.label}</p>
    </Badge>
  );
};
