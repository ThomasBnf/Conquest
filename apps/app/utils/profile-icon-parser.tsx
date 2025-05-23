import { Badge } from "@conquest/ui/badge";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Twitter } from "@conquest/ui/icons/Twitter";
import { Profile } from "@conquest/zod/schemas/profile.schema";

type Props = {
  profile: Profile;
  displayUsername?: boolean;
};

export const ProfileIconParser = ({
  profile,
  displayUsername = false,
}: Props) => {
  const { source } = profile.attributes;
  const IconComponent = getIconComponent(source);

  if (!displayUsername) {
    return (
      <Badge variant="outline">
        <IconComponent size={16} />
      </Badge>
    );
  }

  const username = getUsernameBySource(profile);

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

const getUsernameBySource = (profile: Profile) => {
  const { source } = profile.attributes;

  switch (source) {
    case "Discord":
      return profile.attributes.username;
    case "Discourse":
      return profile.attributes.username;
    case "Github":
      return profile.attributes.login;
    case "Livestorm":
      return profile.externalId;
    case "Linkedin":
      return profile.externalId;
    case "Slack":
      return profile.externalId;
    case "Twitter":
      return profile.attributes.username;
    default:
      return null;
  }
};
