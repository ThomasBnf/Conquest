import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import type { Source } from "@conquest/zod/enum/source.enum";
import { Discord } from "../icons/Discord";
import { Discourse } from "../icons/Discourse";
import { Github } from "../icons/Github";
import { Linkedin } from "../icons/Linkedin";
import { Livestorm } from "../icons/Livestorm";
import { Slack } from "../icons/Slack";

type Props = {
  source: Source;
  transparent?: boolean;
  onlyIcon?: boolean;
  className?: string;
};

type SourceConfig = {
  label: string;
  Icon?: React.ComponentType<{ className?: string }>;
};

const sourceConfigs: Record<Source, SourceConfig> = {
  SLACK: { label: "Slack", Icon: Slack },
  MANUAL: { label: "Manual" },
  API: { label: "API" },
  DISCOURSE: { label: "Discourse", Icon: Discourse },
  DISCORD: { label: "Discord", Icon: Discord },
  GITHUB: { label: "Github", Icon: Github },
  LINKEDIN: { label: "Linkedin", Icon: Linkedin },
  LIVESTORM: { label: "Livestorm", Icon: Livestorm },
} as const;

export const SourceBadge = ({
  source,
  transparent = false,
  onlyIcon = false,
  className,
}: Props) => {
  const config = sourceConfigs[source];
  const { Icon, label } = config;

  return (
    <Badge
      variant={transparent ? "transparent" : "secondary"}
      className={cn("gap-2", className)}
    >
      {Icon && <Icon className="size-3.5" />}
      {!onlyIcon && <span className="font-medium text-sm">{label}</span>}
    </Badge>
  );
};
