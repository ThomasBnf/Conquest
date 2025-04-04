import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Twitter } from "@conquest/ui/icons/Twitter";
import { Separator } from "@conquest/ui/separator";
import { TwitterProfile } from "@conquest/zod/schemas/profile.schema";

type Props = {
  profile: TwitterProfile;
};

export const TwitterSection = ({ profile }: Props) => {
  const { username } = profile.attributes;

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
