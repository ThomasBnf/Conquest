import { Badge } from "@conquest/ui/badge";

import {
  DiscordProfileSchema,
  Profile,
  SlackProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { getIcon } from "./getIcon";

type Props = {
  profile: Profile;
  displayUsername?: boolean;
};

export const ProfileIconParser = ({
  profile,
  displayUsername = false,
}: Props) => {
  const { attributes } = profile;
  const IconComponent = getIcon(attributes.source);

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
