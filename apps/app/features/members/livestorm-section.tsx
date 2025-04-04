import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Separator } from "@conquest/ui/separator";
import { LivestormProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: LivestormProfile;
};

export const LivestormSection = ({ profile }: Props) => {
  const { external_id } = profile;

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Livestorm size={16} /> <p>Livestorm</p>
          </div>
          <MenuProfile profile={profile} />
        </div>
        <FieldCard icon="User" label="Id">
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
