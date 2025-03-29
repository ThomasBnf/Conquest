import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Twitter } from "@conquest/ui/icons/Twitter";
import { Separator } from "@conquest/ui/separator";
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

  const twitter = TwitterProfileSchema.parse(profile);
  const { username } = twitter.attributes;

  return (
    <>
      <div className="space-y-2 p-4">
        <FieldCard icon={<Twitter size={16} />} label="X">
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
