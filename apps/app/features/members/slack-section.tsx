import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { trpc } from "@/server/client";
import { Slack } from "@conquest/ui/icons/Slack";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  type Profile,
  SlackProfileSchema,
} from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const SlackSection = ({ profiles }: Props) => {
  const { data } = trpc.integrations.bySource.useQuery({ source: "Slack" });

  if (!data) return null;

  const slack = SlackIntegrationSchema.parse(data);
  const { url } = slack.details;

  const profile = profiles?.find(
    (profile) => profile.attributes.source === "Slack",
  );

  if (!profile) return null;

  const slackProfile = SlackProfileSchema.parse(profile);
  const { external_id } = slackProfile;

  return (
    <FieldCard icon={<Slack size={14} />} label="Slack">
      <EditableLink
        placeholder="No slack profile"
        defaultValue={external_id}
        href={`${url}team/${external_id}`}
        editable={false}
      />
    </FieldCard>
  );
};
