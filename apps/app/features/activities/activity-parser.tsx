import type { ActivityWithTypeAndMember } from "@conquest/zod/activity.schema";
import { APIActivity } from "./api-activity";
import { DiscourseActivity } from "./discourse/discourse-activity";
import { LinkedinActivity } from "./linkedin/linkedin-activity";
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
    case "DISCOURSE":
      return <DiscourseActivity activity={activity} />;
    case "SLACK":
      return <SlackActivity activity={activity} />;
    case "LIVESTORM":
      return <LivestormActivity activity={activity} />;
    case "LINKEDIN":
      return <LinkedinActivity activity={activity} />;
  }
};
