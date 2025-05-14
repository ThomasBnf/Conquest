import { trpc } from "@/server/client";
import { Slack } from "@conquest/ui/icons/Slack";
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
  const { externalId, attributes } = profile;
  const { displayName } = attributes;

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded border bg-background">
          <Slack size={16} />
        </div>
        <p>{displayName}</p>
        <MenuProfile href={`${url}team/${externalId}`} profile={profile} />
      </div>
    </div>
  );
};
