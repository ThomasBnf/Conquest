import { Badge } from "@conquest/ui/badge";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Twitter } from "@conquest/ui/icons/Twitter";
import {
  DiscordProfileSchema,
  Profile,
  SlackProfileSchema,
} from "@conquest/zod/schemas/profile.schema";

type Props = {
  profile: Profile;
  displayUsername?: boolean;
};

export const ProfileIconParser = ({
  profile,
  displayUsername = false,
}: Props) => {
  const { attributes, externalId } = profile;
  const IconComponent = getIconComponent(attributes.source);

  if (!displayUsername) {
    return (
      <Badge variant="outline">
        <IconComponent size={16} />
      </Badge>
    );
  }

  const username = getUsername(attributes.source, profile);

  return (
    <Badge variant="outline" className="truncate">
      <IconComponent size={16} />
      <p>{username}</p>
    </Badge>
  );
};

const getIconComponent = (source: string) => {
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

const getUsername = (source: string, profile: Profile) => {
  switch (source) {
    case "Discord": {
      const discord = DiscordProfileSchema.parse(profile);
      return discord.attributes.username;
    }
    case "Slack": {
      const slack = SlackProfileSchema.parse(profile);
      return slack.attributes.realName;
    }
    default:
      return profile.externalId;
  }
};
