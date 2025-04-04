import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Twitter } from "@conquest/ui/icons/Twitter";
import { Profile } from "@conquest/zod/schemas/profile.schema";

export const ProfileIconParser = ({ profile }: { profile: Profile }) => {
  switch (profile.attributes.source) {
    case "Discord":
      return <Discord size={16} />;
    case "Discourse":
      return <Discourse size={16} />;
    case "Github":
      return <Github size={16} />;
    case "Livestorm":
      return <Livestorm size={16} />;
    case "Linkedin":
      return <Linkedin size={16} />;
    case "Slack":
      return <Slack size={16} />;
    case "Twitter":
      return <Twitter size={16} />;
  }
};
