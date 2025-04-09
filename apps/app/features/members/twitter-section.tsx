import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Twitter } from "@conquest/ui/icons/Twitter";
import { Separator } from "@conquest/ui/separator";
import { TwitterProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: TwitterProfile;
};

export const TwitterSection = ({ profile }: Props) => {
  const { username } = profile.attributes;

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Twitter size={14} />
          </div>
          <MenuProfile profile={profile} />
        </div>
        <FieldCard label="Username">
          <EditableLink
            placeholder="No X profile"
            defaultValue={username}
            href={`https://x.com/${username}`}
            editable={false}
          />
        </FieldCard>
      </div>
      <Separator />
    </>
  );
};
