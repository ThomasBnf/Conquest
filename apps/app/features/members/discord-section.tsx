import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Discord } from "@conquest/ui/icons/Discord";
import { Separator } from "@conquest/ui/separator";
import { DiscordProfile } from "@conquest/zod/schemas/profile.schema";

type Props = {
  profile: DiscordProfile;
};

export const DiscordSection = ({ profile }: Props) => {
  const { external_id, attributes } = profile;
  const { username } = attributes;

  return (
    <>
      <div className="space-y-2 p-4">
        <FieldCard icon={<Discord size={14} />} label="Discord">
          <EditableLink
            placeholder="No discord profile"
            defaultValue={username}
            href={`https://discordapp.com/users/${external_id}`}
            editable={false}
          />
        </FieldCard>
      </div>
      <Separator />
    </>
  );
};
