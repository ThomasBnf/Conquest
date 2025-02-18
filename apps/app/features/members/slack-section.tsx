import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Slack } from "@/components/icons/Slack";
import { trpc } from "@/server/client";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  type Profile,
  SlackProfileSchema,
} from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const SlackSection = ({ profiles }: Props) => {
  const { data: integration } =
    trpc.integrations.getIntegrationBySource.useQuery({
      source: "SLACK",
    });

  if (!integration) return null;

  const slack = SlackIntegrationSchema.parse(integration);
  const { url } = slack.details;

  const profile = profiles?.find(
    (profile) => profile.attributes.source === "SLACK",
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
