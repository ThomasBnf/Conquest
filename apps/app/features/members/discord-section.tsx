import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Discord } from "@conquest/ui/icons/Discord";
import { Separator } from "@conquest/ui/separator";
import { DiscordProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: DiscordProfile;
};

export const DiscordSection = ({ profile }: Props) => {
  const { externalId, attributes } = profile;
  const { username } = attributes;

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Discord size={14} /> <p>Discord</p>
          </div>
          <MenuProfile profile={profile} />
        </div>
        <FieldCard label="Username">
          <EditableLink
            placeholder="No discord profile"
            defaultValue={username}
            href={`https://discordapp.com/users/${externalId}`}
            editable={false}
          />
        </FieldCard>
      </div>
      <Separator />
    </>
  );
};
