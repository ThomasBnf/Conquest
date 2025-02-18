import { Discord } from "@/components/icons/Discord";
import { Discourse } from "@/components/icons/Discourse";
import { Livestorm } from "@/components/icons/Livestorm";
import { Slack } from "@/components/icons/Slack";

export const categories = [
  {
    label: "Community",
    integrations: [
      {
        href: "/settings/integrations/slack",
        logo: <Slack />,
        name: "Slack",
        description: "Sync your Slack community members",
        soon: false,
      },
      {
        href: "/settings/integrations/discourse",
        logo: <Discourse />,
        name: "Discourse",
        description: "Sync your Discourse community members",
        soon: false,
      },
      {
        href: "/settings/integrations/discord",
        logo: <Discord />,
        name: "Discord",
        description: "Sync your Discord community members",
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
      //   name: "Linkedin",
      //   description: "Sync your Linkedin organization page",
      //   soon: true,
      // },
      {
        href: "/settings/integrations/livestorm",
        logo: <Livestorm />,
        name: "Livestorm",
        description: "Sync your Livestorm events and attendees",
        soon: false,
      },
    ],
  },
  // {
  //   label: "Tech",
  //   integrations: [
  //     {
  //       href: "/settings/integrations/github",
  //       logo: <Github />,
  //       name: "Github",
  //       description: "Synchronize your members with Github",
  //       soon: true,
  //     },
  //   ],
  // },
];
