import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Integration } from "@conquest/zod/integration.schema";

type Props = {
  integrations: (Integration | undefined)[];
  member: MemberWithActivities;
};

export const getPoints = ({ integrations, member }: Props) => {
  if (!member.activities?.length) return 0;

  const integrationsBySource = new Map(
    integrations.map((integration) => [
      integration?.details.source,
      integration?.details.points_config,
    ]),
  );

  return member.activities.reduce((total, activity) => {
    const source = activity.details.source as "SLACK" | "DISCOURSE";
    const pointsConfig = integrationsBySource.get(source);
    if (!pointsConfig) return total;

    switch (activity.details.type) {
      case "POST":
        return total + pointsConfig.post;
      case "REACTION":
        return total + pointsConfig.reaction;
      case "REPLY":
        return total + pointsConfig.reply;
      case "INVITATION":
        return total + pointsConfig.invitation;
      default:
        return total;
    }
  }, 0);
};
