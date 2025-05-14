import { Twitter } from "@conquest/ui/icons/Twitter";
import { TwitterProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: TwitterProfile;
};

export const TwitterSection = ({ profile }: Props) => {
  const { username } = profile.attributes;

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded border bg-background">
          <Twitter size={16} />
        </div>
        <p>{username}</p>
        <MenuProfile href={`https://x.com/${username}`} profile={profile} />
      </div>
    </div>
  );
};
