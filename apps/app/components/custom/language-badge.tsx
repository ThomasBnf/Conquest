import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";

type Props = {
  locale: string | null;
  variant?: "secondary" | "transparent";
  className?: string;
};

export const LanguageBadge = ({
  locale,
  variant = "secondary",
  className,
}: Props) => {
  const [language] = locale?.split("_") || [];

  if (!language || !locale) return null;

  const languageName = new Intl.DisplayNames(["en"], {
    type: "language",
  }).of(language);

  if (!languageName) return null;

  return (
    <Badge variant={variant} className={cn("gap-2", className)}>
      <p className="truncate font-medium">{languageName}</p>
    </Badge>
  );
};
