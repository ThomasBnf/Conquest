import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { APIActivity } from "./api-activity";
import { DiscordActivity } from "./discord/discord-activity";
import { DiscourseActivity } from "./discourse/discourse-activity";
import { LinkedinActivity } from "./linkedin/linkedin-activity";
import { LivestormActivity } from "./livestorm/livestorm-activity";
import { ManualActivity } from "./manual/manual-activity";
import { SlackActivity } from "./slack/slack-activity";

type Props = {
  activity: ActivityWithTypeAndMember;
};

export const ActivityParser = ({ activity }: Props) => {
  const { source } = activity.activity_type;

  switch (source) {
    case "API":
      return <APIActivity activity={activity} />;
    case "DISCORD":
      return <DiscordActivity activity={activity} />;
    case "DISCOURSE":
      return <DiscourseActivity activity={activity} />;
    case "LINKEDIN":
      return <LinkedinActivity activity={activity} />;
    case "LIVESTORM":
      return <LivestormActivity activity={activity} />;
    case "MANUAL":
      return <ManualActivity activity={activity} />;
    case "SLACK":
      return <SlackActivity activity={activity} />;
  }
};
