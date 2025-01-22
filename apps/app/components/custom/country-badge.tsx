import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import type { Country } from "react-phone-number-input";
import { FlagComponent } from "./phone-input";

type Props = {
  locale: string | null;
  variant?: "secondary" | "transparent";
  className?: string;
};

export const CountryBadge = ({
  locale,
  variant = "secondary",
  className,
}: Props) => {
  const [_, country] = locale?.split("_") || [];

  if (!country || !locale) return null;

  const regionName = new Intl.DisplayNames(["en"], {
    type: "region",
  }).of(country);

  if (!regionName) return null;

  return (
    <Badge variant={variant} className={cn("gap-2", className)}>
      <FlagComponent country={country as Country} countryName={regionName} />
      <p className="truncate font-medium">{regionName}</p>
    </Badge>
  );
};
