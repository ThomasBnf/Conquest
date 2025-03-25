import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Separator } from "@conquest/ui/separator";
import {
  LivestormProfileSchema,
  type Profile,
} from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const LivestormSection = ({ profiles }: Props) => {
  const profile = profiles?.find(
    (profile) => profile.attributes.source === "Livestorm",
  );

  if (!profile) return null;

  const livestormProfile = LivestormProfileSchema.parse(profile);
  const { external_id } = livestormProfile;

  return (
    <>
      <div className="space-y-2 p-4">
        <FieldCard icon={<Livestorm size={16} />} label="Livestorm">
          <EditableLink
            placeholder="No livestorm profile"
            defaultValue={external_id}
            editable={false}
            redirect={false}
          />
        </FieldCard>
      </div>
      <Separator />
    </>
  );
};
