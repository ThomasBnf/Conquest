import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import type { Source } from "@conquest/zod/enum/source.enum";
import { Brevo } from "../icons/Brevo";
import { Discord } from "../icons/Discord";
import { Discourse } from "../icons/Discourse";
import { Github } from "../icons/Github";
import { Hubspot } from "../icons/Hubspot";
import { Linkedin } from "../icons/Linkedin";
import { Livestorm } from "../icons/Livestorm";
import { Slack } from "../icons/Slack";
import { X } from "../icons/X";
import { Zendesk } from "../icons/Zendesk";

type Props = {
  source: Source;
  className?: string;
};

export const SourceBadge = ({ source, className }: Props) => {
  switch (source) {
    case "SLACK":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Slack className="size-3.5" />
          <span className="font-medium text-sm">Slack</span>
        </Badge>
      );
    case "MANUAL":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <span className="font-medium text-sm">Manual</span>
        </Badge>
      );
    case "API":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <span className="font-medium text-sm">API</span>
        </Badge>
      );
    case "HUBSPOT":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Hubspot className="size-3.5" />
          <span className="font-medium text-sm">Hubspot</span>
        </Badge>
      );
    case "BREVO":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Brevo className="size-3.5" />
          <span className="font-medium text-sm">Brevo</span>
        </Badge>
      );
    case "DISCOURSE":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Discourse className="size-3.5" />
          <span className="font-medium text-sm">Discourse</span>
        </Badge>
      );
    case "DISCORD":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Discord className="size-3.5" />
          <span className="font-medium text-sm">Discord</span>
        </Badge>
      );
    case "GITHUB":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Github className="size-3.5" />
          <span className="font-medium text-sm">Github</span>
        </Badge>
      );
    case "LINKEDIN":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Linkedin className="size-3.5" />
          <span className="font-medium text-sm">Linkedin</span>
        </Badge>
      );
    case "ZENDESK":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Zendesk className="size-3.5" />
          <span className="font-medium text-sm">Zendesk</span>
        </Badge>
      );
    case "LIVESTORM":
      return (
        <Badge variant="secondary" className={cn("gap-2", className)}>
          <Livestorm className="size-3.5" />
          <span className="font-medium text-sm">Livestorm</span>
        </Badge>
      );
    case "X":
      return (
        <Badge variant="secondary" className={cn("h-[26px] gap-2", className)}>
          <X className="size-3.5" />
        </Badge>
      );
  }
};
