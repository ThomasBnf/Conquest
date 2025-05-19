import { Badge } from "@conquest/ui/badge";
import ISO6391 from "iso-639-1";
import { cn } from "../../../../packages/ui/src/lib/utils";

type Props = {
  language: string | null;
  transparent?: boolean;
  className?: string;
};

export const LanguageBadge = ({
  language,
  transparent = false,
  className,
}: Props) => {
  const languages = ISO6391.getAllNames();
  const currentLanguage = languages.find((l) => l === language);

  if (!currentLanguage) return null;

  return (
    <Badge
      variant={transparent ? "transparent" : "secondary"}
      className={cn("gap-2", className)}
    >
      <p className="truncate font-medium">{currentLanguage}</p>
    </Badge>
  );
};
