import type { ActivityWithTypeAndMember } from "@conquest/zod/activity.schema";
import { APIActivity } from "./api-activity";
import { LivestormActivity } from "./livestorm/livestorm-activity";
import { SlackActivity } from "./slack/slack-activity";

type Props = {
  activity: ActivityWithTypeAndMember;
};

export const ActivityParser = ({ activity }: Props) => {
  const { source } = activity.activity_type;

  switch (source) {
    case "API":
      return <APIActivity activity={activity} />;
    case "SLACK":
      return <SlackActivity activity={activity} />;
    case "LIVESTORM":
      return <LivestormActivity activity={activity} />;
  }
};
