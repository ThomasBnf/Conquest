import { Badge } from "@conquest/ui/badge";

import { Profile } from "@conquest/zod/schemas/profile.schema";
import { getIcon } from "./getIcon";

type Props = {
  profile: Profile;
  displayUsername?: boolean;
};

export const ProfileIconParser = ({
  profile,
  displayUsername = false,
}: Props) => {
  const { attributes, externalId } = profile;
  const IconComponent = getIcon(attributes.source);

  if (!displayUsername) {
    return (
      <Badge variant="outline">
        <IconComponent size={16} />
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="truncate">
      <IconComponent size={16} />
      <p>{externalId}</p>
    </Badge>
  );
};
