import { Badge } from "@conquest/ui/badge";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Twitter } from "@conquest/ui/icons/Twitter";
import type { FullMember } from "@conquest/zod/schemas/member.schema";

type Props = {
  member: FullMember;
};

export const ProfilesCell = ({ member }: Props) => {
  return (
    <div className="flex items-center gap-1">
      {member.profiles
        ?.sort((a, b) => a.attributes.source.localeCompare(b.attributes.source))
        .map((profile) => {
          const { source } = profile.attributes;
          const IconComponent = getIconComponent(source);

          return (
            <Badge key={profile.id} variant="outline">
              <IconComponent size={16} />
            </Badge>
          );
        })}
    </div>
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
