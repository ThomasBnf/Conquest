import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Twitter } from "@/components/icons/Twitter";
import {
  type Profile,
  TwitterProfileSchema,
} from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const TwitterSection = ({ profiles }: Props) => {
  const profile = profiles?.find(
    (profile) => profile.attributes.source === "Twitter",
  );

  if (!profile) return null;

  const twitterProfile = TwitterProfileSchema.parse(profile);
  const { external_id } = twitterProfile;

  return (
    <FieldCard icon={<Twitter size={16} />} label="Twitter">
      <EditableLink
        placeholder="No twitter profile"
        defaultValue={external_id}
        editable={false}
        redirect={false}
      />
    </FieldCard>
  );
};
