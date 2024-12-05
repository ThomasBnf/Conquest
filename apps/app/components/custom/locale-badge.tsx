import { Badge } from "@conquest/ui/src/components/badge";
import { cn } from "@conquest/ui/src/utils/cn";
import flags from "react-phone-number-input/flags";

type Props = {
  country: string | null;
  className?: string;
};

export const LocaleBadge = ({ country, className }: Props) => {
  const countryCode = country?.split("-")[1];
  if (!countryCode) return null;

  const Flag = flags[countryCode as keyof typeof flags];
  if (!Flag) return null;

  const countryName = new Intl.DisplayNames(["en"], { type: "region" }).of(
    countryCode,
  );
  return (
    <Badge variant="outline" className={cn("gap-2", className)}>
      <div className="flex h-3.5 w-5 overflow-hidden rounded">
        <Flag title={countryCode} />
      </div>
      <span className="font-medium text-sm">{countryName}</span>
    </Badge>
  );
};
