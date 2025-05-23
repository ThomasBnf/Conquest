import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { countries } from "country-data-list";
import { CircleFlag } from "react-circle-flags";
import type { Country } from "../editable/editable-country";

type Props = {
  country: string | null;
  transparent?: boolean;
  className?: string;
};

export const CountryBadge = ({
  country,
  transparent = false,
  className,
}: Props) => {
  const allCountries = countries.all.filter(
    (country: Country) =>
      country.emoji && country.status !== "deleted" && country.ioc !== "PRK",
  );

  const currentCountry = allCountries.find((c) => c.alpha2 === country);

  if (!currentCountry) return null;

  return (
    <Badge
      variant={transparent ? "transparent" : "outline"}
      className={cn("gap-2 truncate", className)}
    >
      <CircleFlag
        className="size-3.5"
        countryCode={currentCountry.alpha2.toLocaleLowerCase()}
      />
      <p className="truncate font-medium">{currentCountry?.name}</p>
    </Badge>
  );
};
