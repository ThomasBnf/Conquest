import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { trpc } from "@/server/client";
import { Slack } from "@conquest/ui/icons/Slack";
import { Separator } from "@conquest/ui/separator";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { SlackProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: SlackProfile;
};

export const SlackSection = ({ profile }: Props) => {
  const { data } = trpc.integrations.bySource.useQuery({ source: "Slack" });

  if (!data) return null;

  const slack = SlackIntegrationSchema.parse(data);
  const { url } = slack.details;

  const { external_id } = profile;
  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Slack size={16} /> <p>Slack</p>
          </div>
          <MenuProfile profile={profile} />
        </div>
        <FieldCard icon="User" label="Id">
          <EditableLink
            placeholder="No slack profile"
            defaultValue={external_id}
            href={`${url}team/${external_id}`}
            editable={false}
          />
        </FieldCard>
      </div>
      <Separator />
    </>
  );
};
