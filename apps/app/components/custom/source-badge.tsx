import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import type { Source } from "@conquest/zod/enum/source.enum";
import { Slack } from "../icons/Slack";

type Props = {
  source: Source;
  className?: string;
};

export const SourceBadge = ({ source, className }: Props) => {
  switch (source) {
    case "SLACK":
      return (
        <Badge variant="outline" className={cn("gap-2", className)}>
          <Slack className="size-3.5" />
          <span className="font-medium text-sm">Slack</span>
        </Badge>
      );
  }
};
