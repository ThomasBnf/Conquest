import { trpc } from "@/server/client";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { DiscourseDetailsSchema } from "@conquest/zod/schemas/integration.schema";
import { DiscourseProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: DiscourseProfile;
};

export const DiscourseSection = ({ profile }: Props) => {
  const source = "Discourse";
  const { data: discourse } = trpc.integrations.bySource.useQuery({ source });

  const details = discourse
    ? DiscourseDetailsSchema.parse(discourse?.details)
    : null;

  const { communityUrl } = details ?? {};
  const { externalId } = profile;

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded border bg-background">
          <Discourse size={16} />
        </div>
        <p>{externalId}</p>
        <MenuProfile
          href={`${communityUrl}/u/${externalId}/summary`}
          profile={profile}
        />
      </div>
    </div>
  );
};
