import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import { APIActivity } from "./api-activity";
import { SlackActivity } from "./slack/slack-activity";
type Props = {
  activity: ActivityWithMember;
};

export const ActivityParser = ({ activity }: Props) => {
  const { source } = activity.activity_type;

  switch (source) {
    case "API":
      return <APIActivity activity={activity} />;
    case "SLACK":
      return <SlackActivity activity={activity} />;
  }
};
