import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import ISO6391 from "iso-639-1";

type Props = {
  language: string | null;
  variant?: "secondary" | "transparent";
  className?: string;
};

export const LanguageBadge = ({
  language,
  variant = "secondary",
  className,
}: Props) => {
  const languages = ISO6391.getAllNames();
  const currentLanguage = languages.find((l) => l === language);

  if (!currentLanguage) return null;

  return (
    <Badge variant={variant} className={cn("gap-2", className)}>
      <p className="truncate font-medium">{currentLanguage}</p>
    </Badge>
  );
};
