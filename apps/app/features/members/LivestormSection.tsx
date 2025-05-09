import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { LivestormProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: LivestormProfile;
};

export const LivestormSection = ({ profile }: Props) => {
  const { externalId } = profile;

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded border bg-background">
          <Livestorm size={16} />
        </div>
        <p>{externalId}</p>
        <MenuProfile
          href={`https://livestorm.io/${externalId}`}
          profile={profile}
        />
      </div>
    </div>
  );
};
