import { SlackMarkdown } from "@/features/activities/slack/slack-markdown";
import type { ActivityWithTypeAndMember } from "@conquest/zod/activity.schema";
import { SlackReaction } from "./slack/slack-reaction";
import { SlackReply } from "./slack/slack-reply";

type Props = {
  activity: ActivityWithTypeAndMember;
  isNested?: boolean;
};

export const Message = ({ activity }: Props) => {
  const { key } = activity.activity_type;

  if (key === "slack:reaction") {
    return <SlackReaction activity={activity} />;
  }

  if (key === "slack:reply") {
    return <SlackReply activity={activity} />;
  }

  return <SlackMarkdown activity={activity} />;
};
