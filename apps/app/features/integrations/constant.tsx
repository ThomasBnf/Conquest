import { Discord } from "@/components/icons/Discord";
import { Discourse } from "@/components/icons/Discourse";
import { Github } from "@/components/icons/Github";
import { Livestorm } from "@/components/icons/Livestorm";
import { Slack } from "@/components/icons/Slack";

export const categories = [
  {
    label: "Community",
    integrations: [
      {
        href: "/settings/integrations/discord",
        logo: <Discord />,
        source: "Discord" as const,
        description: "Sync your Discord community members",
        soon: false,
      },
      {
        href: "/settings/integrations/discourse",
        logo: <Discourse />,
        source: "Discourse" as const,
        description: "Sync your Discourse community members",
        soon: false,
      },
      {
        href: "/settings/integrations/slack",
        logo: <Slack />,
        source: "Slack" as const,
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
      //   source: "Linkedin" as const,
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
        soon: true,
      },
    ],
  },
];
