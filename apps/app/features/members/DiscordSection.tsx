import { Discord } from "@conquest/ui/icons/Discord";
import { DiscordProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: DiscordProfile;
};

export const DiscordSection = ({ profile }: Props) => {
  const { externalId, attributes } = profile;
  const { username } = attributes;

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded bg-discord/20">
          <Discord size={16} />
        </div>
        <p>{username}</p>
        <MenuProfile
          href={`https://discordapp.com/users/${externalId}`}
          profile={profile}
        />
      </div>
    </div>
  );
};
