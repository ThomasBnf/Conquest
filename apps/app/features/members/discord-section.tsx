import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Discord } from "@/components/icons/Discord";
import {
  DiscordProfileSchema,
  type Profile,
} from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const DiscordSection = ({ profiles }: Props) => {
  const profile = profiles?.find(
    (profile) => profile.attributes.source === "Discord",
  );

  if (!profile) return null;

  const discordProfile = DiscordProfileSchema.parse(profile);
  const { external_id, attributes } = discordProfile;
  const { username } = attributes;

  return (
    <FieldCard icon={<Discord size={14} />} label="Discord">
      <EditableLink
        placeholder="No discord profile"
        defaultValue={username}
        href={`https://discordapp.com/users/${external_id}`}
        editable={false}
      />
    </FieldCard>
  );
};
