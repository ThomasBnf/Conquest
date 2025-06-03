import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Source } from "@conquest/zod/enum/source.enum";
import { ReactNode } from "react";

export const categories: {
  label: string;
  integrations: {
    href: string;
    logo: ReactNode;
    source: Source;
    description: string;
    soon: boolean;
  }[];
}[] = [
  {
    label: "Community",
    integrations: [
      {
        href: "/settings/integrations/discord",
        logo: <Discord />,
        source: "Discord",
        description: "Sync your Discord community members",
        soon: false,
      },
      {
        href: "/settings/integrations/discourse",
        logo: <Discourse />,
        source: "Discourse",
        description: "Sync your Discourse community members",
        soon: false,
      },
      {
        href: "/settings/integrations/slack",
        logo: <Slack />,
        source: "Slack",
        description: "Sync your Slack community members",
        soon: false,
      },
    ],
  },
  {
    label: "Marketing",
    integrations: [
      // {
      //   href: "/settings/integrations/linkedin",
      //   logo: <Linkedin />,
      //   source: "Linkedin"
      //   description: "Sync your Linkedin organization page",
      //   soon: true,
      // },
      {
        href: "/settings/integrations/livestorm",
        logo: <Livestorm />,
        source: "Livestorm" as const,
        description: "Sync your Livestorm events and attendees",
        soon: false,
      },
    ],
  },
  {
    label: "Tech",
    integrations: [
      {
        href: "/settings/integrations/github",
        logo: <Github />,
        source: "Github" as const,
        description: "Synchronize your members with Github",
        soon: false,
      },
    ],
  },
];
