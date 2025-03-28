import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Twitter } from "@conquest/ui/icons/Twitter";
import type { Source } from "@conquest/zod/enum/source.enum";

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
  Slack: { label: "Slack", Icon: Slack },
  Manual: { label: "Manual" },
  Api: { label: "API" },
  Discourse: { label: "Discourse", Icon: Discourse },
  Discord: { label: "Discord", Icon: Discord },
  Github: { label: "Github", Icon: Github },
  Linkedin: { label: "Linkedin", Icon: Linkedin },
  Livestorm: { label: "Livestorm", Icon: Livestorm },
  Twitter: { label: "Twitter", Icon: Twitter },
} as const;

export const SourceBadge = ({
  source,
  transparent = false,
  onlyIcon = false,
  className,
}: Props) => {
  const config = sourceConfigs[source] ?? { label: source, Icon: null };
  const { Icon, label } = config;

  return (
    <Badge
      variant={transparent ? "transparent" : "secondary"}
      className={cn("w-fit gap-2", className)}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {!onlyIcon && <span className="font-medium text-sm">{label}</span>}
    </Badge>
  );
};
