import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Twitter } from "@conquest/ui/icons/Twitter";

export const getIcon = (source: string) => {
  switch (source) {
    case "Discord":
      return Discord;
    case "Discourse":
      return Discourse;
    case "Github":
      return Github;
    case "Livestorm":
      return Livestorm;
    case "Linkedin":
      return Linkedin;
    case "Slack":
      return Slack;
    case "Twitter":
      return Twitter;
    default:
      return Discord;
  }
};
